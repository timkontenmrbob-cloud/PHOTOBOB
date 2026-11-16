import React, { useEffect, useState } from 'react';
import { sharingRequest } from '../services/photoSharing';

export const DownloadScreen: React.FC = () => {
  const token = location.hash.slice(1);
  const [state, setState] = useState<'loading' | 'ready' | 'pending' | 'expired' | 'error'>('loading');
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [expiresAt, setExpiresAt] = useState(0);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    let timer: number | undefined;
    const check = async () => {
      try {
        if (!/^[a-f0-9]{64}$/.test(token)) throw new Error('Link foto tidak valid. Scan ulang QR dari photobox.');
        const result = await sharingRequest({ action: 'status', token }, false, controller.signal);
        if (!active) return;
        setState(result.status);
        setExpiresAt(result.expiresAt || 0);
        setPreviews(result.previews || {});
        if (result.status === 'pending') timer = window.setTimeout(check, 2000);
        if (result.status === 'ready') timer = window.setTimeout(check, Math.min(45000, Math.max(1000, result.expiresAt - Date.now())));
      } catch (error) {
        if (active) { setState('error'); setMessage(error instanceof Error ? error.message : 'Gagal membuka foto.'); }
      }
    };
    void check();
    return () => { active = false; controller.abort(); window.clearTimeout(timer); };
  }, [token, retry]);
  async function download(variant: 'color' | 'bw') {
    setBusy(true); setMessage('');
    try {
      // Always request a fresh, short-lived link. Never store signed URLs.
      const result = await sharingRequest({ action: 'download', token, variant });
      const anchor = document.createElement('a');
      anchor.href = result.url;
      anchor.download = `photobox-${variant}.jpg`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Download gagal.'); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-white px-6 py-12 text-center text-brand-dark"><div className="max-w-sm mx-auto">
    <h1 className="text-3xl font-extrabold mb-4">Foto Kenanganmu</h1>
    {state === 'loading' && <p>Memeriksa foto...</p>}
    {state === 'pending' && <p>Fotomu masih menunggu upload dari photobox. Halaman ini akan memeriksa otomatis. Simpan link ini untuk dibuka lagi nanti.</p>}
    {state === 'expired' && <p>Masa download 30 hari sudah berakhir. Foto ini sudah tidak tersedia.</p>}
    {state === 'ready' && <>
      <div className="grid grid-cols-2 gap-3 mb-5">{['bw', 'color'].map(variant => <img key={variant} src={previews[variant]} referrerPolicy="no-referrer" alt={variant === 'bw' ? 'Foto hitam putih' : 'Foto full color'} className="w-full rounded-xl" />)}</div>
      <p className="mb-6 text-brand-muted">Dua versi dari momen yang sama, siap kamu simpan.</p>
      <button disabled={busy} onClick={() => void download('bw')} className="w-full p-4 bg-brand-dark text-white rounded-2xl font-semibold mb-3 disabled:opacity-50">Download Hitam Putih</button>
      <button disabled={busy} onClick={() => void download('color')} className="w-full p-4 bg-brand-blue text-white rounded-2xl font-semibold mb-5 disabled:opacity-50">Download Full Color</button>
      <p className="text-sm text-brand-muted">Tersedia sampai {new Date(expiresAt).toLocaleString('id-ID')}. Simpan kedua file sebelum batas waktu.</p>
    </>}
    {message && <p role="alert" className="text-red-600 mt-4">{message}</p>}
    {state === 'error' && <button className="mt-4 text-brand-blue underline" onClick={() => setRetry(value => value + 1)}>Coba lagi</button>}
  </div></main>;
};
