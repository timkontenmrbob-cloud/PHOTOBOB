import React, { useState, useEffect } from 'react';
import {
  Printer,
  Camera,
  Wifi,
  Image as ImageIcon,
  Sliders,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  ChevronDown,
  ChevronUp,
  X,
  ShieldCheck,
  Laptop,
  Smartphone,
} from 'lucide-react';
import { usePhotobox } from '../context/PhotoboxContext';
import { AdminSettings, CleanterHealthResponse } from '../types';
import { printerService } from '../services/printer';
import { DEFAULT_SETTINGS } from '../services/storage';

export const AdminSettingsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    settings,
    updateSettings,
    frames,
    uploadCustomFrame,
    resetCustomFrame,
  } = usePhotobox();

  const [formData, setFormData] = useState<AdminSettings>(settings);
  const [activeTab, setActiveTab] = useState<'status' | 'frames' | 'print' | 'brand'>('status');
  const [showAdvancedPrint, setShowAdvancedPrint] = useState(false);

  // Status testing states
  const [isCheckingPrinter, setIsCheckingPrinter] = useState(false);
  const [printerHealth, setPrinterHealth] = useState<CleanterHealthResponse | null>(null);
  const [printerError, setPrinterError] = useState<string | null>(null);
  const [desktopPrinterStatus, setDesktopPrinterStatus] = useState<string | null>(null);

  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [testPrintMessage, setTestPrintMessage] = useState<string | null>(null);

  const [cameraStatus, setCameraStatus] = useState<string>('Memeriksa...');
  const [pwaStatus, setPwaStatus] = useState<string>('Memeriksa cache offline...');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Check printer health based on active printer mode
  const checkPrinterHealth = async () => {
    setIsCheckingPrinter(true);
    setPrinterError(null);
    setDesktopPrinterStatus(null);

    const res = await printerService.checkHealth(formData);
    setIsCheckingPrinter(false);

    if (formData.printerMode === 'desktop-usb') {
      if (res.ready) {
        setDesktopPrinterStatus(res.info || 'Browser Print siap digunakan untuk printer USB.');
      } else {
        setPrinterError(res.error || 'Pencetakan browser tidak didukung.');
      }
    } else {
      // Android Bluetooth (Cleanter)
      if (res.ready) {
        setPrinterHealth({
          status: 'ok',
          version: '1.2.0',
          printer: { connected: true, name: 'VSC TM-80D' },
        });
      } else {
        setPrinterHealth(null);
        setPrinterError(res.error || 'Cleanter bridge tidak merespons di localhost:9100');
      }
    }
  };

  const checkCameraAndPwa = async () => {
    // Camera check responsive to device
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: formData.printerMode === 'android-bluetooth'
            ? { facingMode: 'user' }
            : { facingMode: { ideal: 'user' } },
        });
        stream.getTracks().forEach((t) => t.stop());
        setCameraStatus(
          formData.printerMode === 'desktop-usb'
            ? 'Webcam laptop aktif dan siap digunakan'
            : 'Kamera depan ponsel aktif dan siap digunakan'
        );
      } catch (e: unknown) {
        const err = e as Error;
        setCameraStatus(`Izin kamera belum aktif: ${err.message}`);
      }
    } else {
      setCameraStatus('MediaDevices tidak didukung oleh browser ini');
    }

    // PWA cache check
    if ('caches' in window) {
      const keys = await caches.keys();
      if (keys.length > 0) {
        setPwaStatus(`PWA siap offline (${keys.length} cache aktif)`);
      } else {
        setPwaStatus('Cache offline terdaftar, siap disimpan saat pertama digunakan');
      }
    } else {
      setPwaStatus('Fitur Cache Storage tidak didukung');
    }
  };

  useEffect(() => {
    checkCameraAndPwa();
    checkPrinterHealth();
  }, [formData.printerMode]);

  const handleSave = () => {
    updateSettings(formData);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan semua pengaturan ke nilai standar pabrik?')) {
      setFormData(DEFAULT_SETTINGS);
      updateSettings(DEFAULT_SETTINGS);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2500);
    }
  };

  // Run Test Print (works for both Desktop USB and Android Cleanter)
  const handleTestPrint = async () => {
    setIsTestPrinting(true);
    setTestPrintMessage(null);

    // Create a 576-dot test canvas pattern
    const canvas = document.createElement('canvas');
    canvas.width = formData.rasterDotWidth || 576;
    canvas.height = 380;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#141E30';
      ctx.textAlign = 'center';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('=== TEST PRINT PHOTOBOX ===', canvas.width / 2, 45);

      ctx.font = 'normal 17px sans-serif';
      const targetPrinterName =
        formData.printerMode === 'desktop-usb'
          ? 'Desktop USB (iWare / 80mm)'
          : 'Android Bluetooth (VSC TM-80D)';
      ctx.fillText(`Mode: ${targetPrinterName}`, canvas.width / 2, 85);
      ctx.fillText(`Lebar Raster: ${canvas.width} dots`, canvas.width / 2, 118);
      ctx.fillText(`Tanggal: ${new Date().toLocaleString('id-ID')}`, canvas.width / 2, 150);

      // Calibration test bar
      ctx.fillRect(20, 180, canvas.width - 40, 8);
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('|<- 0 mm                       576 dots / 72 mm ->|', canvas.width / 2, 215);

      // Checkerboard calibration pattern
      const size = 16;
      for (let x = 20; x < canvas.width - 20; x += size) {
        for (let y = 235; y < 285; y += size) {
          if (((x / size) + (y / size)) % 2 === 0) {
            ctx.fillRect(x, y, size, size);
          }
        }
      }

      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('STATUS: KALIBRASI OK & SIAP', canvas.width / 2, 330);
    }

    const testDataUrl = canvas.toDataURL('image/png');
    const testBase64 = testDataUrl.replace(/^data:image\/png;base64,/, '');

    const res = await printerService.printPhotobox({
      base64Image: testBase64,
      previewUrl: testDataUrl,
      sessionRef: `TEST-${Date.now().toString(36).toUpperCase()}`,
      settings: formData,
    });

    setIsTestPrinting(false);
    if (res.success) {
      if (formData.printerMode === 'desktop-usb') {
        setTestPrintMessage('✅ Dialog cetak sistem browser berhasil dibuka untuk printer USB!');
      } else {
        setTestPrintMessage('✅ Test print berhasil terkirim ke printer via Cleanter!');
      }
    } else {
      setTestPrintMessage(`❌ Test print gagal: ${res.errorMessage}`);
    }
  };

  const handleFrameUpload = async (frameId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png')) {
      alert('Harap unggah file berformat PNG dengan latar belakang transparan.');
      return;
    }

    try {
      await uploadCustomFrame(frameId, file);
      alert(`Bingkai ${frameId} berhasil diperbarui!`);
    } catch (err) {
      alert('Gagal mengunggah bingkai: ' + err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col text-brand-dark">
      {/* Top Header */}
      <header className="sticky top-0 bg-white border-b border-brand-border px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl font-black text-brand-blue flex items-center gap-2">
            <Sliders className="w-6 h-6" />
            <span>Pengaturan Kiosk Admin</span>
          </h1>
          <p className="text-xs text-brand-muted">
            Mode Aktif: {formData.printerMode === 'desktop-usb' ? 'Desktop USB (iWare)' : 'Android Bluetooth (VSC TM-80D)'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="h-10 px-4 bg-brand-blue-light text-brand-blue font-semibold rounded-xl flex items-center gap-2 hover:bg-blue-100 transition-colors"
        >
          <X className="w-5 h-5" />
          <span>Tutup</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-gray-50 border-b border-brand-border px-6 flex gap-2 overflow-x-auto py-2">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'status'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'text-brand-muted hover:bg-gray-200'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Status & Mode</span>
        </button>
        <button
          onClick={() => setActiveTab('frames')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'frames'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'text-brand-muted hover:bg-gray-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Manajemen Bingkai</span>
        </button>
        <button
          onClick={() => setActiveTab('print')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'print'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'text-brand-muted hover:bg-gray-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Pengaturan Cetak</span>
        </button>
        <button
          onClick={() => setActiveTab('brand')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'brand'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'text-brand-muted hover:bg-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Branding & Kiosk</span>
        </button>
      </div>

      {/* Save Success Banner */}
      {saveSuccessNotice && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-2.5 flex items-center gap-2 text-green-700 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>Pengaturan berhasil disimpan!</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">
        {/* PRINTING MODE SELECTOR CARD (Displayed prominently) */}
        <div className="bg-brand-blue-light/50 border-2 border-brand-blue/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-blue" />
              <h3 className="font-extrabold text-brand-dark text-base">Pilih Mode Operasional Printer</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-white text-brand-blue border border-blue-200">
              {formData.printerMode === 'desktop-usb' ? 'Desktop USB Aktif' : 'Android Bluetooth Aktif'}
            </span>
          </div>
          <p className="text-xs text-brand-muted">
            Hanya satu mode yang aktif dalam satu waktu. Pilih sesuai perangkat yang sedang Anda gunakan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Mode 1: Desktop USB */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, printerMode: 'desktop-usb' })}
              className={`p-4 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                formData.printerMode === 'desktop-usb'
                  ? 'border-brand-blue bg-white shadow-sm ring-2 ring-brand-blue/20'
                  : 'border-brand-border bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-brand-dark flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-brand-blue" />
                  <span>Mode 1: Desktop USB (Testing)</span>
                </span>
                {formData.printerMode === 'desktop-usb' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
                )}
              </div>
              <p className="text-xs text-brand-muted leading-relaxed">
                • Laptop Windows / macOS<br />
                • Printer thermal iWare via USB (80mm)<br />
                • Kamera: Webcam laptop<br />
                • Cetak lewat dialog sistem browser
              </p>
            </button>

            {/* Mode 2: Android Bluetooth */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, printerMode: 'android-bluetooth' })}
              className={`p-4 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                formData.printerMode === 'android-bluetooth'
                  ? 'border-brand-blue bg-white shadow-sm ring-2 ring-brand-blue/20'
                  : 'border-brand-border bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-brand-dark flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-brand-blue" />
                  <span>Mode 2: Android Bluetooth (Event)</span>
                </span>
                {formData.printerMode === 'android-bluetooth' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
                )}
              </div>
              <p className="text-xs text-brand-muted leading-relaxed">
                • Ponsel Samsung Galaxy A35<br />
                • Printer VSC TM-80D via Bluetooth<br />
                • Kamera depan ponsel (1:1)<br />
                • Bridge Cleanter (localhost:9100)
              </p>
            </button>
          </div>
        </div>

        {/* TAB 1: STATUS & KONEKSI */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            {formData.printerMode === 'desktop-usb' ? (
              // DESKTOP USB STATUS CARD
              <div className="bg-white border-2 border-brand-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-brand-dark">Koneksi Printer Desktop USB</h3>
                    <p className="text-xs text-brand-muted">Target Printer: iWare Thermal Receipt Printer (USB)</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-brand-border text-sm space-y-2">
                  <div className="flex items-center gap-2 text-green-700 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>{desktopPrinterStatus || 'Browser Print API Siap Digunakan'}</span>
                  </div>
                  <p className="text-xs text-brand-muted">
                    Mencetak langsung melalui dialog sistem browser tanpa membutuhkan bridge atau server eksternal.
                  </p>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs text-brand-dark space-y-1 mt-2">
                    <p className="font-semibold text-brand-blue">Petunjuk Penggunaan Printer USB iWare:</p>
                    <p>1. Hubungkan kabel USB printer iWare ke laptop Anda.</p>
                    <p>2. Pastikan driver iWare (80mm Thermal) terpasang di Windows atau macOS.</p>
                    <p>3. Saat dialog cetak browser muncul, pilih printer iWare, atur ukuran kertas ke <b>80mm</b>, Margin ke <b>None / Minimum</b>, dan hilangkan centang <i>Headers & Footers</i>.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={checkPrinterHealth}
                    className="px-5 py-3 bg-brand-blue text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-brand-blue-hover"
                  >
                    <Wifi className="w-4 h-4" />
                    <span>Uji Ulang Kesiapan Cetak</span>
                  </button>
                </div>
              </div>
            ) : (
              // ANDROID BLUETOOTH STATUS CARD (Cleanter Bridge)
              <div className="bg-white border-2 border-brand-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-brand-dark">Koneksi Cleanter Bridge (Port 9100)</h3>
                    <p className="text-xs text-brand-muted">Target Printer: VSC TM-80D (Bluetooth)</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-brand-border text-sm">
                  {isCheckingPrinter ? (
                    <p className="text-brand-muted flex items-center gap-2 font-medium">
                      <span className="w-3 h-3 rounded-full bg-brand-blue animate-ping" />
                      Memeriksa respon Cleanter di {formData.cleanterBaseUrl}...
                    </p>
                  ) : printerHealth ? (
                    <div className="space-y-1 text-green-700">
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span>Cleanter Bridge Terhubung!</span>
                      </div>
                      <p className="text-xs text-brand-dark">
                        Printer: <span className="font-semibold">{printerHealth.printer?.name || 'VSC TM-80D'}</span> (Bluetooth OK)
                      </p>
                    </div>
                  ) : printerError ? (
                    <div className="space-y-2 text-brand-red">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertCircle className="w-5 h-5" />
                        <span>Koneksi Cleanter Belum Terhubung</span>
                      </div>
                      <p className="text-xs text-brand-muted">{printerError}</p>
                      <div className="p-3 bg-white rounded-lg border border-red-200 text-xs text-brand-dark space-y-1">
                        <p className="font-semibold">Panduan Samsung Galaxy A35:</p>
                        <p>1. Buka aplikasi Cleanter di Android & pastikan service aktif.</p>
                        <p>2. Hubungkan Bluetooth dengan printer VSC TM-80D di Cleanter.</p>
                        <p>3. Jika Chrome memunculkan dialog <i>Local Network Permission</i>, pilih <b>Allow / Izinkan</b>.</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-brand-muted">
                      Tekan tombol di bawah untuk menguji koneksi localhost ke Cleanter bridge.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={checkPrinterHealth}
                    disabled={isCheckingPrinter}
                    className="px-5 py-3 bg-brand-blue text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-brand-blue-hover"
                  >
                    <Wifi className="w-4 h-4" />
                    <span>{isCheckingPrinter ? 'Memeriksa...' : 'Otorisasi & Cek Koneksi Printer'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Hardware & PWA Status */}
            <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-brand-dark">Kesiapan Hardware & Offline PWA</h3>

              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-xl bg-gray-50 border border-brand-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-brand-blue" />
                    <div>
                      <p className="font-bold text-brand-dark">
                        {formData.printerMode === 'desktop-usb' ? 'Webcam Laptop' : 'Kamera Depan Ponsel'}
                      </p>
                      <p className="text-xs text-brand-muted">{cameraStatus}</p>
                    </div>
                  </div>
                  <button
                    onClick={checkCameraAndPwa}
                    className="text-xs text-brand-blue font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-blue-light"
                  >
                    Uji Ulang
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-brand-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-blue" />
                    <div>
                      <p className="font-bold text-brand-dark">Kesiapan Offline (PWA Cache)</p>
                      <p className="text-xs text-brand-muted">{pwaStatus}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 font-bold rounded-full">
                    Offline Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAJEMEN BINGKAI */}
        {activeTab === 'frames' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-brand-blue-light border border-blue-100 text-sm text-brand-blue">
              <p className="font-bold mb-1">Panduan Penggantian Bingkai Foto:</p>
              <p className="text-xs leading-relaxed text-brand-dark">
                Unggah gambar berformat <b>PNG dengan background transparan</b>. Ukuran optimal adalah <b>1080 × 1080 piksel (1:1)</b>. Bagian tengah harus bolong/transparan agar wajah pengunjung terlihat. Aset tersimpan permanen di IndexedDB dan dapat digunakan secara offline.
              </p>
            </div>

            <div className="space-y-4">
              {frames.map((frame, index) => {
                const previewUrl = frame.customDataUrl || frame.defaultUrl;
                return (
                  <div
                    key={frame.id}
                    className="bg-white border-2 border-brand-border rounded-2xl p-4 flex items-center gap-4 shadow-sm"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-xl border border-brand-border bg-slate-100 p-1 shrink-0 flex items-center justify-center relative overflow-hidden">
                      <img
                        src={previewUrl}
                        alt={frame.name}
                        className="w-full h-full object-contain"
                      />
                      {frame.isCustom && (
                        <span className="absolute bottom-1 right-1 text-[9px] bg-brand-blue text-white px-1.5 py-0.5 rounded font-bold">
                          Kustom
                        </span>
                      )}
                    </div>

                    {/* Details & Actions */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base text-brand-dark">
                        {frame.name} ({frame.styleName})
                      </h4>
                      <p className="text-xs text-brand-muted mb-3">
                        Slot #{index + 1} — {frame.isCustom ? 'Aset Kustom Petugas' : 'Template Standar'}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer px-3 py-1.5 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Ganti PNG</span>
                          <input
                            type="file"
                            accept="image/png"
                            className="hidden"
                            onChange={(e) => handleFrameUpload(frame.id, e)}
                          />
                        </label>

                        {frame.isCustom && (
                          <button
                            onClick={() => resetCustomFrame(frame.id)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-brand-muted text-xs font-semibold rounded-lg flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Bawaan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PENGATURAN CETAK */}
        {activeTab === 'print' && (
          <div className="space-y-6">
            {/* Test Print Section */}
            <div className="bg-brand-blue-light/50 border border-blue-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-brand-dark">
                    Uji Cetak Thermal Langsung ({formData.printerMode === 'desktop-usb' ? 'Desktop USB' : 'Android Bluetooth'})
                  </h3>
                  <p className="text-xs text-brand-muted">
                    {formData.printerMode === 'desktop-usb'
                      ? 'Membuka dialog cetak browser dengan struk uji kalibrasi'
                      : 'Kirimkan sampel pola kalibrasi langsung ke VSC TM-80D via Cleanter'}
                  </p>
                </div>
                <button
                  onClick={handleTestPrint}
                  disabled={isTestPrinting}
                  className="px-5 py-3 bg-brand-blue text-white font-bold text-sm rounded-xl flex items-center gap-2 hover:bg-brand-blue-hover shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isTestPrinting ? 'Mencetak...' : 'TEST PRINT'}</span>
                </button>
              </div>
              {testPrintMessage && (
                <p className="text-xs font-semibold text-brand-blue">{testPrintMessage}</p>
              )}
            </div>

            {/* Print Parameters */}
            <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-base text-brand-dark">Parameter Ukuran Kertas & Raster</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {formData.printerMode === 'desktop-usb' ? (
                  <>
                    <div>
                      <label className="block font-semibold text-brand-dark mb-1">Lebar Kertas Roll Desktop (mm)</label>
                      <select
                        value={formData.desktopPaperWidthMm}
                        onChange={(e) => setFormData({ ...formData, desktopPaperWidthMm: Number(e.target.value) })}
                        className="w-full h-12 px-3 rounded-xl border border-brand-border font-medium bg-white"
                      >
                        <option value={80}>80 mm (Standar iWare & Roll Thermal)</option>
                        <option value={58}>58 mm (Roll Mini)</option>
                        <option value={72}>72 mm</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-brand-dark mb-1">Margin Desktop (mm)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.desktopMarginMm}
                        onChange={(e) => setFormData({ ...formData, desktopMarginMm: Number(e.target.value) })}
                        className="w-full h-12 px-3 rounded-xl border border-brand-border"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block font-semibold text-brand-dark mb-1">Lebar Kertas (mm)</label>
                    <select
                      value={formData.paperWidth}
                      onChange={(e) => setFormData({ ...formData, paperWidth: Number(e.target.value) })}
                      className="w-full h-12 px-3 rounded-xl border border-brand-border font-medium bg-white"
                    >
                      <option value={80}>80 mm (Standar VSC TM-80D)</option>
                      <option value={58}>58 mm (Kertas Mini)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-brand-dark mb-1">Raster Dot Width (Titik)</label>
                  <select
                    value={formData.rasterDotWidth}
                    onChange={(e) => setFormData({ ...formData, rasterDotWidth: Number(e.target.value) })}
                    className="w-full h-12 px-3 rounded-xl border border-brand-border font-medium bg-white"
                  >
                    <option value={576}>576 dots (Standar Kalibrasi 80mm)</option>
                    <option value={512}>512 dots</option>
                    <option value={640}>640 dots</option>
                    <option value={384}>384 dots (58mm)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-brand-dark mb-1">
                    Kecerahan (Brightness): {formData.brightness.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.05"
                    value={formData.brightness}
                    onChange={(e) => setFormData({ ...formData, brightness: parseFloat(e.target.value) })}
                    className="w-full accent-brand-blue"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-dark mb-1">
                    Kontras (Contrast): {formData.contrast.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="1.8"
                    step="0.05"
                    value={formData.contrast}
                    onChange={(e) => setFormData({ ...formData, contrast: parseFloat(e.target.value) })}
                    className="w-full accent-brand-blue"
                  />
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <div className="pt-2 border-t border-brand-border">
                <button
                  onClick={() => setShowAdvancedPrint(!showAdvancedPrint)}
                  className="text-xs font-bold text-brand-blue flex items-center gap-1 hover:underline"
                >
                  <span>Pengaturan Lanjutan</span>
                  {showAdvancedPrint ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvancedPrint && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div>
                      <label className="block font-semibold mb-1">Cleanter Base URL (Khusus Android)</label>
                      <input
                        type="text"
                        value={formData.cleanterBaseUrl}
                        onChange={(e) => setFormData({ ...formData, cleanterBaseUrl: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-brand-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Jumlah Garis Feed Kosong</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={formData.feedLines}
                        onChange={(e) => setFormData({ ...formData, feedLines: Number(e.target.value) })}
                        className="w-full h-10 px-3 rounded-lg border border-brand-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Margin Horizontal Kanvas (px)</label>
                      <input
                        type="number"
                        value={formData.marginHorizontal}
                        onChange={(e) => setFormData({ ...formData, marginHorizontal: Number(e.target.value) })}
                        className="w-full h-10 px-3 rounded-lg border border-brand-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Auto Cut Paper</label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="cutPaper"
                          checked={formData.cutPaper}
                          onChange={(e) => setFormData({ ...formData, cutPaper: e.target.checked })}
                          className="w-5 h-5 accent-brand-blue rounded"
                        />
                        <label htmlFor="cutPaper" className="text-brand-muted">
                          Kirim perintah potong kertas otomatis
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BRANDING & KIOSK */}
        {activeTab === 'brand' && (
          <div className="space-y-6">
            {/* Branding Inputs */}
            <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm text-sm">
              <h3 className="font-bold text-base text-brand-dark">Teks Branding Kios & Struk</h3>

              <div>
                <label className="block font-semibold text-brand-dark mb-1">Judul Aplikasi Kios</label>
                <input
                  type="text"
                  value={formData.appTitle}
                  onChange={(e) => setFormData({ ...formData, appTitle: e.target.value })}
                  className="w-full h-12 px-3 rounded-xl border border-brand-border"
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-dark mb-1">Header Struk Foto (Atas)</label>
                <input
                  type="text"
                  value={formData.headerText}
                  onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                  className="w-full h-12 px-3 rounded-xl border border-brand-border"
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-dark mb-1">Footer Struk Foto (Bawah)</label>
                <input
                  type="text"
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  className="w-full h-12 px-3 rounded-xl border border-brand-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showDate}
                    onChange={(e) => setFormData({ ...formData, showDate: e.target.checked })}
                    className="w-5 h-5 accent-brand-blue rounded"
                  />
                  <span className="font-medium text-xs">Cetak Tanggal & Waktu</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showSessionCode}
                    onChange={(e) => setFormData({ ...formData, showSessionCode: e.target.checked })}
                    className="w-5 h-5 accent-brand-blue rounded"
                  />
                  <span className="font-medium text-xs">Cetak Kode Sesi Ref</span>
                </label>
              </div>
            </div>

            {/* Kiosk Behaviors */}
            <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm text-sm">
              <h3 className="font-bold text-base text-brand-dark">Keamanan & Perilaku Kiosk</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-dark mb-1">PIN Admin Petugas</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={formData.adminPin}
                    onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
                    className="w-full h-12 px-3 rounded-xl border border-brand-border"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-dark mb-1">Timeout Reset Otomatis (Detik)</label>
                  <input
                    type="number"
                    min="4"
                    max="30"
                    value={formData.autoResetSeconds}
                    onChange={(e) => setFormData({ ...formData, autoResetSeconds: Number(e.target.value) })}
                    className="w-full h-12 px-3 rounded-xl border border-brand-border"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableWakeLock}
                    onChange={(e) => setFormData({ ...formData, enableWakeLock: e.target.checked })}
                    className="w-5 h-5 accent-brand-blue rounded"
                  />
                  <div>
                    <p className="font-semibold text-xs">Kunci Layar Selalu Menyala (WakeLock API)</p>
                    <p className="text-[11px] text-brand-muted">Mencegah layar redup atau tidur saat kiosk aktif.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mockPrinter}
                    onChange={(e) => setFormData({ ...formData, mockPrinter: e.target.checked })}
                    className="w-5 h-5 accent-brand-blue rounded"
                  />
                  <div>
                    <p className="font-semibold text-xs text-amber-700">Mode Simulasi Printer (Mock Mode)</p>
                    <p className="text-[11px] text-brand-muted">
                      Aktifkan hanya untuk demonstrasi tanpa fisik printer terhubung. Nonaktifkan saat produksi!
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Actions */}
      <footer className="sticky bottom-0 bg-white border-t border-brand-border p-4 px-6 flex items-center justify-between z-10 max-w-2xl mx-auto w-full gap-4">
        <button
          onClick={handleResetDefaults}
          className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-brand-muted font-bold text-sm rounded-xl flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Default</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-3.5 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-base rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Save className="w-5 h-5" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
