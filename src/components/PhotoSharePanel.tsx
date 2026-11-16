import React, { useEffect, useState } from 'react';
import qrcode from 'qrcode-generator';
import { usePhotobox } from '../context/PhotoboxContext';
import { getShareJob, PhotoShareJob } from '../services/db';
import { photoShareUrl, sharingConfigured, processShareQueue } from '../services/photoSharing';

export const PhotoSharePanel: React.FC = () => {
  const { session } = usePhotobox();
  const [job, setJob] = useState<PhotoShareJob>();
  const [qr, setQr] = useState('');
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const next = session.shareId ? await getShareJob(session.shareId) : undefined;
      if (active) setJob(next);
    };
    void refresh().catch(() => {});
    const listener = () => { void refresh().catch(() => {}); };
    window.addEventListener('photobox-sharing-updated', listener);
    return () => { active = false; window.removeEventListener('photobox-sharing-updated', listener); };
  }, [session.shareId]);
  useEffect(() => {
    let active = true;
    setQr('');
    if (job && sharingConfigured()) {
      const code = qrcode(0, 'M');
      code.addData(photoShareUrl(job.id));
      code.make();
      if (active) setQr(code.createDataURL(4, 16));
    }
    return () => { active = false; };
  }, [job]);
  if (!sharingConfigured()) return <p className="text-sm text-brand-muted mb-4">Download QR belum aktif. Team perlu menghubungkan penyimpanan di Admin.</p>;
  return (
    <section className="w-full rounded-2xl border border-brand-border p-4 mb-5" aria-live="polite">
      <h2 className="text-xl font-bold">Simpan fotomu di HP</h2>
      {qr ? <img src={qr} alt="QR download foto sesi ini" className="w-56 h-56 mx-auto" /> : <p className="py-5">{session.shareError || 'Menyiapkan dua versi foto...'}</p>}
      {qr && <a className="text-brand-blue underline" href={photoShareUrl(job!.id)} target="_blank" rel="noreferrer">Buka halaman foto</a>}
      <p className="text-sm text-brand-muted mt-2">Semua fotomu! · Tersedia 30 hari</p>
      {job?.status === 'queued' && <><p className="text-sm mt-2">Upload tertunda. Kamu bisa scan sekarang; foto tersedia setelah beberapa saat.</p><button className="text-brand-blue underline mt-2" onClick={() => void processShareQueue()}>Coba upload lagi</button></>}
      {job?.status === 'ready' && <p className="text-sm mt-2">Siap diunduh sampai {new Date(job.expiresAt).toLocaleDateString('id-ID')}.</p>}
      {session.shareError && qr && <p className="text-sm text-red-600">{session.shareError}</p>}
    </section>
  );
};
