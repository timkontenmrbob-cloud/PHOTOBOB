import React, { useEffect, useRef, useState } from 'react';
import { usePhotobox } from '../context/PhotoboxContext';
import { AdminSettings, PrintCalibration } from '../types';
import { composePhotoboxLayout, ComposeResult } from '../services/compositor';
import { NEUTRAL_CALIBRATION } from '../services/printCalibration';
import { printerService } from '../services/printer';
import { loadCalibrationPhoto, saveCalibrationPhoto } from '../services/db';

interface Props {
  settings: AdminSettings;
  onChange: (settings: AdminSettings) => void;
  onSave: (settings: AdminSettings) => void;
}

function routeName(settings: AdminSettings) {
  return settings.printerMode === 'windows-qz'
    ? settings.qzUseRawEscpos ? 'ESC/POS via QZ' : 'Driver Windows via QZ'
    : settings.printerMode === 'windows-usb' ? 'Chrome / USB' : 'Bluetooth / Cleanter';
}
const methodName = (method: string) => method === 'original' ? 'Foto asli tanpa filter' : method === 'diffusion' ? 'Titik halus' : method === 'threshold' ? 'Hitam putih tegas' : 'Grayscale natural';

async function loadImage(url: string) {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Gagal membaca gambar sampel.'));
    image.src = url;
  });
  return image;
}

// Labels exist only on test strips. Production photos never get calibration text.
async function labeledSample(result: ComposeResult, settings: AdminSettings, number: number, frameName: string) {
  const image = await loadImage(result.previewUrl);
  const canvas = document.createElement('canvas');
  canvas.width = result.width;
  const scale = canvas.width / 576;
  canvas.height = result.height + Math.round(144 * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Gagal menyiapkan label sampel.');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  ctx.fillStyle = '#000';
  const cal = settings.printOriginalPhoto !== false ? { ...NEUTRAL_CALIBRATION, method: 'original' as const } : settings.printCalibration || NEUTRAL_CALIBRATION;
  const lines = [
    `SAMPEL #${number} | ${routeName(settings)}`,
    `Terang ${cal.brightness.toFixed(2)} | Kontras ${cal.contrast.toFixed(2)} | Gamma ${cal.gamma.toFixed(2)}`,
    `${methodName(cal.method)} | Ambang ${cal.threshold} | ${frameName}`,
    `Lebar ${settings.windowsPrintableWidthMm || 72} mm | Raster ${result.width} px`,
    `${new Date().toLocaleString('id-ID')} | Nilai: ____ / 5`,
  ];
  lines.forEach((line, i) => {
    ctx.font = `${i === 0 ? 'bold ' : ''}${Math.round((i === 0 ? 19 : 16) * scale)}px Arial, sans-serif`;
    ctx.fillText(line, 12 * scale, result.height + (26 + i * 24) * scale, canvas.width - 24 * scale);
  });
  return canvas;
}

export const PrintCalibrationPanel: React.FC<Props> = ({ settings, onChange, onSave }) => {
  const { frames, session } = usePhotobox();
  const [photo, setPhoto] = useState<Blob | null>(session.capturedPhotoBlob || null);
  const photoVersion = useRef(0);
  const [frameId, setFrameId] = useState(frames[0].id);
  const [preview, setPreview] = useState<{ result: ComposeResult; key: string; labelUrl: string } | null>(null);
  const [printing, setPrinting] = useState(false);
  const printLock = useRef(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ number: number; settings: AdminSettings }[]>([]);
  const sampleNumber = useRef(Number(localStorage.getItem('photobox_calibration_sample') || 0));
  const cal = settings.printOriginalPhoto !== false ? { ...NEUTRAL_CALIBRATION, method: 'original' as const } : settings.printCalibration || NEUTRAL_CALIBRATION;
  const raw = settings.printerMode === 'windows-qz' && settings.qzUseRawEscpos;
  const frame = frames.find(item => item.id === frameId) || frames[0];
  const key = JSON.stringify([settings, frameId, frame.customDataUrl, photoVersion.current]);

  useEffect(() => {
    if (photo) return;
    const version = photoVersion.current;
    let cancelled = false;
    void loadCalibrationPhoto().then(saved => {
      if (!cancelled && saved && photoVersion.current === version) setPhoto(saved);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!photo) return;
    let cancelled = false;
    setError('');
    const timer = setTimeout(() => {
      void composePhotoboxLayout({
        photoBlob: photo, frameUrl: frame.customDataUrl || frame.defaultUrl,
        frameId: frame.id, settings, sessionRef: 'CALIBRATION',
      }).then(async result => {
        const labeled = await labeledSample(result, settings, sampleNumber.current + 1, frame.name);
        if (!cancelled) setPreview({ result, key, labelUrl: labeled.toDataURL('image/png') });
      }).catch(reason => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Preview gagal dibuat.');
      });
    }, 150);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [key, photo]);

  const updateCal = (patch: Partial<PrintCalibration>) => {
    setMessage('');
    const method = patch.method || (cal.method === 'original' ? raw ? 'diffusion' : 'grayscale' : cal.method);
    onChange({ ...settings, printOriginalPhoto: method === 'original', printCalibration: { ...cal, ...patch, method } });
  };
  const selectPhoto = (blob: Blob) => {
    photoVersion.current += 1;
    setPhoto(blob);
    setPreview(null);
    setError('');
    void saveCalibrationPhoto(blob).catch(() => setError('Foto bisa dipakai sekarang, tetapi gagal disimpan di device.'));
  };
  const variants = [
    { name: 'A · Setting Saat Ini', calibration: { ...cal } },
    { name: 'B · Lebih Terang', calibration: { ...cal, method: cal.method === 'original' ? raw ? 'diffusion' as const : 'grayscale' as const : cal.method, brightness: Math.min(1.6, cal.brightness + 0.1) } },
    { name: 'C · Lebih Lembut', calibration: { ...cal, method: cal.method === 'original' ? raw ? 'diffusion' as const : 'grayscale' as const : cal.method, brightness: Math.min(1.6, cal.brightness + 0.05), contrast: Math.max(0.5, cal.contrast - 0.15) } },
  ];

  const printSamples = async (batch: boolean) => {
    if (!photo || preview?.key !== key || printLock.current) return;
    printLock.current = true;
    setPrinting(true);
    setError('');
    setMessage('Menyiapkan sampel...');
    // Snapshot settings; changing controls cannot modify a job already submitted.
    const snapshot: AdminSettings = { ...settings, printCalibration: { ...cal } };
    try {
      const samples = batch ? variants : [variants[0]];
      const canvases: HTMLCanvasElement[] = [];
      const submitted: { number: number; settings: AdminSettings }[] = [];
      for (const sample of samples) {
        const calibration = sample.calibration;
        const testSettings = { ...snapshot, printOriginalPhoto: calibration.method === 'original', printCalibration: calibration };
        const result = await composePhotoboxLayout({
          photoBlob: photo, frameUrl: frame.customDataUrl || frame.defaultUrl,
          frameId: frame.id, settings: testSettings, sessionRef: 'CALIBRATION',
        });
        sampleNumber.current += 1;
        localStorage.setItem('photobox_calibration_sample', String(sampleNumber.current));
        canvases.push(await labeledSample(result, testSettings, sampleNumber.current, frame.name));
        submitted.push({ number: sampleNumber.current, settings: testSettings });
      }
      const sheet = document.createElement('canvas');
      sheet.width = canvases[0].width;
      sheet.height = canvases.reduce((sum, item) => sum + item.height, 0);
      const ctx = sheet.getContext('2d');
      if (!ctx) throw new Error('Gagal membuat struk perbandingan.');
      let y = 0;
      for (const canvas of canvases) { ctx.drawImage(canvas, 0, y); y += canvas.height; }
      const url = sheet.toDataURL('image/png');
      const result = await printerService.printPhotobox({
        base64Image: url.replace(/^data:image\/png;base64,/, ''),
        previewUrl: url, settings: snapshot, sessionRef: `CAL-${sampleNumber.current}`,
      });
      if (!result.success) throw new Error(`${result.errorMessage || 'Gagal mencetak.'} ${result.errorFix || ''}`);
      setHistory(previous => [...submitted, ...previous].slice(0, 12));
      setMessage(snapshot.printerMode === 'windows-usb'
        ? 'Dialog cetak dibuka. Label setting ada di bawah setiap foto.'
        : `${samples.length} sampel dikirim. Cek hasil fisik dan pilih setting yang kamu suka.`);
    } catch (reason) {
      setMessage('');
      setError(reason instanceof Error ? reason.message : 'Cetak sampel gagal.');
    } finally {
      printLock.current = false;
      setPrinting(false);
    }
  };

  const selectRoute = (value: string) => {
    setMessage('');
    onChange({
      ...settings,
      printerMode: value === 'usb' ? 'windows-usb' : value === 'bluetooth' ? 'android-bluetooth' : 'windows-qz',
      qzUseRawEscpos: value === 'raw',
      printCalibration: { ...cal, method: value === 'raw' && cal.method === 'grayscale' ? 'diffusion' : cal.method },
    });
  };
  const ready = photo && preview?.key === key && !printing;
  const inputClass = 'w-full rounded-xl border border-brand-border bg-white p-3 text-sm';

  return (
    <section className="rounded-2xl border-2 border-blue-200 bg-white p-4 space-y-4">
      <div>
        <h3 className="font-bold text-lg text-brand-dark">Kalibrasi Foto</h3>
        <p className="text-sm text-brand-muted mt-1">Pakai satu foto, geser setting, lalu cetak. Tidak perlu foto ulang.</p>
      </div>
      <fieldset disabled={printing} className="space-y-4 disabled:opacity-60">
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-xl bg-brand-blue-light text-brand-blue px-4 py-2.5 text-sm font-semibold">
            Pilih Foto Uji
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event => {
              const file = event.target.files?.[0];
              if (file) {
                if (file.size > 15 * 1024 * 1024) setError('Pilih foto maksimal 15 MB.');
                else selectPhoto(file);
              }
              event.target.value = '';
            }} />
          </label>
          {session.capturedPhotoBlob && <button type="button" onClick={() => selectPhoto(session.capturedPhotoBlob!)} className="rounded-xl border border-brand-border px-4 py-2.5 text-sm font-semibold">Pakai Foto Terakhir</button>}
        </div>
        <p className="text-xs text-brand-muted">Foto uji tersimpan di device ini untuk percobaan berikutnya.</p>
        <label className="block text-sm font-semibold">Jalur Cetak
          <select className={`${inputClass} mt-1`} value={settings.printerMode === 'windows-qz' ? raw ? 'raw' : 'driver' : settings.printerMode === 'windows-usb' ? 'usb' : 'bluetooth'} onChange={event => selectRoute(event.target.value)}>
            <option value="raw">ESC/POS langsung · QZ Tray</option>
            <option value="driver">Driver Windows · QZ Tray</option>
            <option value="usb">Chrome / USB</option>
            <option value="bluetooth">Bluetooth / Cleanter</option>
          </select>
        </label>
        {settings.printerMode === 'windows-qz' && <label className="block text-sm font-semibold">Nama Printer QZ
          <input className={`${inputClass} mt-1`} value={settings.qzPrinterName} onChange={event => onChange({ ...settings, qzPrinterName: event.target.value })} />
        </label>}
        <label className="block text-sm font-semibold">Frame Uji
          <select className={`${inputClass} mt-1`} value={frameId} onChange={event => setFrameId(event.target.value)}>{frames.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        </label>
        <div className="rounded-2xl border border-brand-border bg-slate-50 p-3">
          {photo ? <>
            {preview && <img src={preview.labelUrl} alt="Preview kalibrasi cetak beserta label setting" className={`w-full max-w-[280px] mx-auto h-auto ${preview.key !== key ? 'opacity-40' : ''}`} />}
            {preview?.key !== key && !error && <p role="status" className="text-center text-sm mt-2 text-brand-muted">Memperbarui preview...</p>}
          </> : <p className="text-sm text-center text-brand-muted py-12">Pilih foto uji dulu untuk melihat perubahan.</p>}
          <p className="text-xs text-brand-muted mt-3">Preview mengikuti olahan aplikasi. Driver dan kertas dapat mengubah hasil fisik. Mode ESC/POS selalu memakai titik hitam untuk membentuk gradasi.</p>
        </div>
        {([
          ['brightness', 'Kecerahan', 0.6, 1.6, 0.05],
          ['contrast', 'Kontras', 0.5, 1.6, 0.05],
          ['gamma', 'Detail Bayangan (Gamma)', 0.5, 2, 0.05],
        ] as const).map(([field, label, min, max, step]) => <label key={field} className="block text-sm font-semibold">
          {label} <span className="float-right tabular-nums text-brand-blue">{cal[field].toFixed(2)}</span>
          <input type="range" min={min} max={max} step={step} value={cal[field]} onChange={event => updateCal({ [field]: Number(event.target.value) })} className="w-full mt-2 accent-brand-blue" />
        </label>)}
        <p className="text-xs text-brand-muted">Kurangi kontras untuk bayangan lebih lembut. Naikkan gamma untuk membuka detail area gelap.</p>
        <label className="block text-sm font-semibold">Olahan Foto
          <select className={`${inputClass} mt-1`} value={raw && cal.method === 'grayscale' ? 'diffusion' : cal.method} onChange={event => updateCal({ method: event.target.value as PrintCalibration['method'] })}>
            <option value="original">Foto asli · tanpa filter warna atau tekstur</option>
            {!raw && <option value="grayscale">Grayscale natural · tanpa tekstur aplikasi</option>}
            <option value="diffusion">Titik halus · gradasi foto</option>
            <option value="threshold">Hitam putih tegas · tanpa gradasi</option>
          </select>
        </label>
        {cal.method !== 'original' && (raw || cal.method !== 'grayscale') && <label className="block text-sm font-semibold">Ambang Hitam Putih <span className="float-right text-brand-blue">{cal.threshold}</span>
          <input className="w-full mt-2 accent-brand-blue" type="range" min="64" max="192" step="1" value={cal.threshold} onChange={event => updateCal({ threshold: Number(event.target.value) })} />
        </label>}
        <div className="grid grid-cols-3 gap-2">
          {variants.map(item => <button key={item.name} type="button" onClick={() => updateCal(item.calibration)} className="rounded-xl border border-brand-border p-2 text-xs font-semibold hover:bg-brand-blue-light">{item.name}</button>)}
        </div>
        <button type="button" className="text-sm text-brand-blue underline" onClick={() => updateCal({ ...NEUTRAL_CALIBRATION, method: 'original' })}>Pakai Foto Asli Tanpa Filter</button>
      </fieldset>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={!ready} onClick={() => void printSamples(false)} className="rounded-xl bg-brand-blue text-white px-3 py-3 text-sm font-bold disabled:opacity-40">{printing ? 'Memproses...' : 'Cetak Sampel'}</button>
        <button type="button" disabled={!ready} onClick={() => void printSamples(true)} className="rounded-xl border border-brand-blue text-brand-blue px-3 py-3 text-sm font-bold disabled:opacity-40">Cetak 3 Perbandingan</button>
      </div>
      <p className="text-xs text-brand-muted">Setiap foto diberi nomor dan keterangan kalibrasi di bawahnya. Perbandingan A/B/C memakai satu struk panjang, sekitar 30–35 cm untuk kertas 80 mm.</p>
      {history.length > 0 && <div className="space-y-2">
        <p className="text-sm font-semibold">Pilih Hasil yang Paling Kamu Suka</p>
        <div className="flex flex-wrap gap-2">{history.map(item => <button type="button" key={item.number} disabled={printing} onClick={() => {
          onChange(item.settings);
          setMessage(`Setting sampel #${item.number} dipilih. Klik Simpan sebagai Default untuk menerapkannya.`);
        }} className="rounded-lg border border-brand-border px-3 py-2 text-sm font-semibold disabled:opacity-40">Pakai Sampel #{item.number}</button>)}</div>
      </div>}
      <button type="button" disabled={printing} onClick={() => {
        onSave({ ...settings, printCalibration: { ...cal, method: raw && cal.method === 'grayscale' ? 'diffusion' : cal.method } });
        setMessage('Kalibrasi disimpan. Foto berikutnya otomatis memakai setting ini di device ini.');
      }} className="w-full rounded-xl bg-brand-dark text-white px-3 py-3 text-sm font-bold disabled:opacity-40">Simpan sebagai Default</button>
      {message && <p role="status" className="text-sm text-brand-blue">{message}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </section>
  );
};
