import { composePhotoboxLayout, ComposeOptions } from './compositor';
import { deleteShareJob, getShareJobs, PhotoShareJob, saveShareJob } from './db';

const CONFIG_KEY = 'photobox_sharing_config';
export const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
export interface SharingConfig { supabaseUrl: string; kioskKey: string; siteUrl: string }
export function loadSharingConfig(): SharingConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    return { kioskKey: '', siteUrl: location.origin, ...saved, supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '' };
  } catch { return { supabaseUrl: '', kioskKey: '', siteUrl: location.origin }; }
}
export function saveSharingConfig(config: SharingConfig) {
  for (const value of [config.supabaseUrl, config.siteUrl]) {
    const url = new URL(value);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) throw new Error('Gunakan alamat HTTPS.');
    if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw new Error('Gunakan alamat utama website tanpa path, query, atau password.');
  }
  if (config.kioskKey.length < 32) throw new Error('Kunci kiosk minimal 32 karakter.');
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event('photobox-sharing-updated'));
}
export function sharingConfigured() {
  const config = loadSharingConfig();
  return !!(config.supabaseUrl && config.kioskKey && config.siteUrl);
}
export function photoShareUrl(id: string) {
  return `${loadSharingConfig().siteUrl.replace(/\/$/, '')}/download#${id}`;
}
export async function sharingRequest(body: object, kiosk = false, signal?: AbortSignal) {
  const config = loadSharingConfig();
  if (!config.supabaseUrl) throw new Error('Penyimpanan foto belum dihubungkan.');
  const response = await fetch(`${config.supabaseUrl.replace(/\/$/, '')}/functions/v1/photo-share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(kiosk ? { Authorization: `Bearer ${config.kioskKey}` } : {}) },
    body: JSON.stringify(body), signal: signal || AbortSignal.timeout(30000), cache: 'no-store',
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Penyimpanan belum bisa diakses.');
  return result;
}
export async function queuePhotoShare(options: ComposeOptions, createdAt: number): Promise<PhotoShareJob> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const id = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  const result = await composePhotoboxLayout({ ...options, digital: true });
  if (!result.colorBlob || !result.bwBlob) throw new Error('Dua versi foto gagal dibuat.');
  const job: PhotoShareJob = {
    id, sessionId: options.sessionRef, colorBlob: result.colorBlob, bwBlob: result.bwBlob,
    createdAt, expiresAt: createdAt + RETENTION_MS, status: 'queued',
  };
  // Persist before displaying a QR or attempting any network operation.
  await saveShareJob(job);
  window.dispatchEvent(new Event('photobox-sharing-updated'));
  void processShareQueue();
  return job;
}
let processing = false;
let processAgain = false;
export async function processShareQueue() {
  if (processing) { processAgain = true; return; }
  processing = true;
  try {
    const jobs = await getShareJobs();
    for (const job of jobs) {
      if (job.expiresAt <= Date.now()) { await deleteShareJob(job.id); continue; }
      if (job.status === 'ready' || !navigator.onLine || !sharingConfigured()) continue;
      try {
        const result = await sharingRequest({ action: 'prepare', token: job.id, createdAt: job.createdAt }, true);
        if (!result.ready) {
          const uploads = await Promise.allSettled((['color', 'bw'] as const).map(async variant => {
            const blob = variant === 'color' ? job.colorBlob : job.bwBlob;
            if (!blob) throw new Error('File antrean tidak ditemukan.');
            const upload = await fetch(result.uploads[variant], {
              method: 'PUT', headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'max-age=0' },
              body: blob, signal: AbortSignal.timeout(45000),
            });
            if (!upload.ok) throw new Error('Upload belum berhasil. Foto tersimpan di antrean.');
          }));
          const failed = uploads.find((result): result is PromiseRejectedResult => result.status === 'rejected');
          if (failed) throw failed.reason;
          await sharingRequest({ action: 'complete', token: job.id }, true);
        }
        // Retain the receipt, release local image space after BOTH files are confirmed.
        await saveShareJob({ ...job, colorBlob: undefined, bwBlob: undefined, status: 'ready', error: undefined, expiresAt: result.expiresAt });
      } catch (error) {
        await saveShareJob({ ...job, error: error instanceof Error ? error.message : 'Upload tertunda.' });
        // Don't repeat a failing server/auth request for every queued session.
        break;
      }
    }
  } catch (error) {
    console.warn('[Photo sharing] Antrean belum dapat diproses', error);
  } finally {
    processing = false;
    window.dispatchEvent(new Event('photobox-sharing-updated'));
    // A capture accepted while a previous batch was uploading must not wait for the retry timer.
    if (processAgain) { processAgain = false; void processShareQueue(); }
  }
}
export function startShareQueue() {
  void processShareQueue();
  const retry = () => { void processShareQueue(); };
  window.addEventListener('online', retry);
  const interval = window.setInterval(retry, 30000);
  return () => { window.removeEventListener('online', retry); window.clearInterval(interval); };
}
