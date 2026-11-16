import React, { useEffect, useState } from 'react';
import { getShareJobs } from '../services/db';
import { loadSharingConfig, processShareQueue, saveSharingConfig, sharingRequest } from '../services/photoSharing';

export const PhotoSharingSettings: React.FC = () => {
  const [config, setConfig] = useState(loadSharingConfig);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(0);
  useEffect(() => {
    const refresh = () => { void getShareJobs().then(jobs => setPending(jobs.filter(job => job.status === 'queued' && job.expiresAt > Date.now()).length)).catch(() => {}); };
    refresh();
    window.addEventListener('photobox-sharing-updated', refresh);
    return () => window.removeEventListener('photobox-sharing-updated', refresh);
  }, []);
  return <section className="rounded-2xl border border-brand-border p-5 space-y-3">
    <h2 className="text-lg font-bold">Download Foto via QR</h2>
    <p className="text-sm text-brand-muted">Dua file JPG: hitam putih dan full color. Masa download 30 hari sejak foto dibuat. Antrean upload: {pending} sesi.</p>
    <label className="block text-sm">Penyimpanan Supabase<input readOnly value={config.supabaseUrl} placeholder="VITE_SUPABASE_URL belum diatur saat build" className="block w-full border rounded-lg p-3 mt-1 bg-gray-50" /></label>
    <label className="block text-sm">Alamat website publik<input value={config.siteUrl} onChange={event => setConfig({ ...config, siteUrl: event.target.value.trim() })} className="block w-full border rounded-lg p-3 mt-1" placeholder="https://photobox.vercel.app" /></label>
    <label className="block text-sm">Kunci upload kiosk<input type="password" autoComplete="off" value={config.kioskKey} onChange={event => setConfig({ ...config, kioskKey: event.target.value.trim() })} className="block w-full border rounded-lg p-3 mt-1" /></label>
    <p className="text-xs text-brand-muted">Gunakan kunci khusus kiosk dari setup. Jangan masukkan service role key Supabase. Jangan hapus data browser saat masih ada antrean.</p>
    <button className="bg-brand-blue text-white rounded-lg p-3" onClick={async () => {
      try {
        if (!config.supabaseUrl) throw new Error('Atur VITE_SUPABASE_URL lalu deploy ulang website.');
        saveSharingConfig(config);
        await sharingRequest({ action: 'health' }, true);
        setMessage('Terhubung. Pengaturan disimpan; antrean akan diunggah.');
        void processShareQueue();
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Koneksi gagal.'); }
    }}>Simpan & Cek Koneksi</button>
    {message && <p role="status" className="text-sm">{message}</p>}
  </section>;
};
