import { createClient } from 'npm:@supabase/supabase-js@2';

const bucket = 'photobox-photos';
const retention = 30 * 24 * 60 * 60 * 1000;
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store, private',
  'Referrer-Policy': 'no-referrer',
};
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
async function hash(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
async function authorized(request: Request, secretName: string) {
  const secret = Deno.env.get(secretName);
  const received = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
  return !!secret && secret.length >= 32 && await hash(received) === await hash(secret);
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method tidak diizinkan.' }, 405);
  try {
    const bodyText = await request.text();
    if (bodyText.length > 2048) return json({ error: 'Request terlalu besar.' }, 413);
    const body = JSON.parse(bodyText);
    const action = body.action;
    if (['prepare', 'complete', 'health'].includes(action) && !await authorized(request, 'PHOTOBOX_KIOSK_KEY')) {
      return json({ error: 'Kunci kiosk tidak cocok. Periksa pengaturan Admin.' }, 401);
    }
    if (action === 'cleanup' && !await authorized(request, 'PHOTOBOX_CRON_KEY')) return json({ error: 'Unauthorized' }, 401);
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const storage = admin.storage.from(bucket);
    if (action === 'health') {
      const { error } = await admin.from('photobox_shares').select('token_hash').limit(1);
      const { data: bucketInfo, error: bucketError } = await admin.storage.getBucket(bucket);
      if (error || bucketError || bucketInfo?.public) throw new Error('Setup penyimpanan belum lengkap atau bucket tidak privat.');
      return json({ ok: true });
    }
    if (action === 'cleanup') {
      // Signed upload URLs live for 2h. Wait out that window before deleting,
      // preventing a delayed upload from recreating already-cleaned files.
      // Download access still ends at expires_at, independently of cleanup.
      // Delete physical objects via Storage API, never by deleting storage.objects rows.
      const { data, error } = await admin.from('photobox_shares').select('token_hash').lte('expires_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()).is('deleted_at', null).limit(100);
      if (error) throw error;
      for (const row of data || []) {
        const paths = ['color', 'bw'].map(variant => `${row.token_hash}/${variant}.jpg`);
        const { error: removeError } = await storage.remove(paths);
        if (removeError) throw removeError;
        const { error: updateError } = await admin.from('photobox_shares').update({ deleted_at: new Date().toISOString(), ready: false }).eq('token_hash', row.token_hash);
        if (updateError) throw updateError;
      }
      return json({ removedSessions: data?.length || 0 });
    }
    if (!['prepare', 'complete', 'status', 'download'].includes(action)) return json({ error: 'Action tidak valid.' }, 400);
    if (typeof body.token !== 'string' || !/^[a-f0-9]{64}$/.test(body.token)) return json({ error: 'Link foto tidak valid.' }, 400);
    const tokenHash = await hash(body.token);
    if (action === 'prepare') {
      const capturedAt = Number(body.createdAt);
      if (!Number.isFinite(capturedAt) || capturedAt <= 0 || capturedAt > Date.now() + 60000) return json({ error: 'Tanggal foto tidak valid.' }, 400);
      const expiresAt = Math.min(capturedAt, Date.now()) + retention;
      if (expiresAt <= Date.now()) return json({ error: 'Masa download foto sudah berakhir.' }, 410);
      // Ignore duplicates: a retry must never extend the expiry or replace a ready session.
      const { error } = await admin.from('photobox_shares').upsert({ token_hash: tokenHash, expires_at: new Date(expiresAt).toISOString() }, { onConflict: 'token_hash', ignoreDuplicates: true });
      if (error) throw error;
    }
    const { data: row, error } = await admin.from('photobox_shares').select('expires_at,ready,deleted_at').eq('token_hash', tokenHash).maybeSingle();
    if (error) throw error;
    // Unknown links may belong to an offline kiosk that has not uploaded yet.
    if (!row) return action === 'status' ? json({ status: 'pending' }) : json({ error: 'Foto belum diunggah.' }, 404);
    const expiresAt = Date.parse(row.expires_at);
    const secondsLeft = Math.floor((expiresAt - Date.now()) / 1000);
    if (secondsLeft < 1 || row.deleted_at) return action === 'status' ? json({ status: 'expired', expiresAt }) : json({ error: 'Masa download 30 hari sudah berakhir.' }, 410);
    if (action === 'prepare') {
      if (row.ready) return json({ ready: true, expiresAt });
      const uploads: Record<string, string> = {};
      for (const variant of ['color', 'bw']) {
        const { data, error } = await storage.createSignedUploadUrl(`${tokenHash}/${variant}.jpg`, { upsert: true });
        if (error) throw error;
        uploads[variant] = data.signedUrl;
      }
      return json({ ready: false, uploads, expiresAt });
    }
    if (action === 'complete') {
      const { data: objects, error: listError } = await storage.list(tokenHash, { limit: 10 });
      if (listError) throw listError;
      if (!['color.jpg', 'bw.jpg'].every(name => objects?.some(object => object.name === name && Number(object.metadata?.size) > 0))) return json({ error: 'Kedua file belum selesai diunggah.' }, 409);
      const { error: updateError } = await admin.from('photobox_shares').update({ ready: true }).eq('token_hash', tokenHash);
      if (updateError) throw updateError;
      return json({ ready: true, expiresAt });
    }
    if (!row.ready) return action === 'status' ? json({ status: 'pending', expiresAt }) : json({ error: 'Foto masih diunggah. Coba sebentar lagi.' }, 409);
    const ttl = Math.min(60, secondsLeft);
    if (action === 'status') {
      const previews: Record<string, string> = {};
      for (const variant of ['color', 'bw']) {
        const { data, error } = await storage.createSignedUrl(`${tokenHash}/${variant}.jpg`, ttl);
        if (error) throw error;
        previews[variant] = data.signedUrl;
      }
      return json({ status: 'ready', expiresAt, previews });
    }
    if (body.variant !== 'color' && body.variant !== 'bw') return json({ error: 'Versi foto tidak valid.' }, 400);
    const { data, error: signError } = await storage.createSignedUrl(`${tokenHash}/${body.variant}.jpg`, ttl, { download: `photobox-${body.variant}.jpg` });
    if (signError) throw signError;
    return json({ url: data.signedUrl, expiresAt });
  } catch (error) {
    console.error('[photo-share]', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'Penyimpanan foto belum bisa diakses. Silakan coba lagi atau hubungi petugas.' }, 500);
  }
});
