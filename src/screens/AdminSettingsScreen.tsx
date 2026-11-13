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
  Command,
  Zap,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { usePhotobox } from '../context/PhotoboxContext';
import { AdminSettings, CleanterHealthResponse, PrinterMode } from '../types';
import { printerService } from '../services/printer';
import { DEFAULT_SETTINGS, loadSettings } from '../services/storage';

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
  const [windowsPrinterStatus, setWindowsPrinterStatus] = useState<string | null>(null);

  // QZ Tray state
  const [detectedPrinters, setDetectedPrinters] = useState<string[]>([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [qzStatus, setQzStatus] = useState<'idle' | 'checking' | 'connected' | 'disconnected'>('idle');
  const [qzStatusMessage, setQzStatusMessage] = useState<string | null>(null);

  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [testPrintMessage, setTestPrintMessage] = useState<string | null>(null);

  const [cameraStatus, setCameraStatus] = useState<string>('Memeriksa...');
  const [pwaStatus, setPwaStatus] = useState<string>('Memeriksa cache offline...');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Immediate persistent mode selector
  const handleSelectMode = (newMode: PrinterMode) => {
    const updated: AdminSettings = { ...formData, printerMode: newMode };
    setFormData(updated);
    updateSettings(updated);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2000);
    console.log(`[AdminSettingsScreen] Mode berhasil diubah ke: ${newMode}`);
  };

  // Immediate persistent printer name selector
  const handleSelectPrinter = (newPrinter: string) => {
    const updated: AdminSettings = { ...formData, qzPrinterName: newPrinter };
    setFormData(updated);
    updateSettings(updated);
    console.log(`[AdminSettingsScreen] Printer target berhasil diubah ke: ${newPrinter}`);
  };

  // Fetch list of Windows printers via QZ Tray WebSocket
  const fetchQZPrinters = async () => {
    setIsLoadingPrinters(true);
    setQzStatus('checking');
    try {
      const qzPrinter = printerService.getQZPrinter();
      const list = await qzPrinter.listPrinters(formData);
      setDetectedPrinters(list);
      setQzStatus('connected');
      if (list.length > 0) {
        setQzStatusMessage(`QZ Tray terhubung (Port 8181 WSS). ${list.length} printer Windows terdeteksi.`);
        // If current qzPrinterName is not in the list or is default, find best candidate
        if (!formData.qzPrinterName || !list.includes(formData.qzPrinterName)) {
          const match = list.find((p) => /iware|d260|pos|thermal|receipt|80mm/i.test(p));
          const chosen = match || list[0];
          const updated: AdminSettings = { ...formData, qzPrinterName: chosen };
          setFormData(updated);
          updateSettings(updated);
          console.log(`[AdminSettingsScreen] Auto-selected printer: ${chosen}`);
        }
      } else {
        setQzStatusMessage('QZ Tray aktif terhubung, namun tidak ada printer terpasang di Windows.');
      }
    } catch (err: unknown) {
      setQzStatus('disconnected');
      const msg = (err as Error)?.message || String(err);
      setQzStatusMessage(`Gagal terhubung ke QZ Tray: ${msg}`);
      setPrinterError(`QZ Tray belum berjalan di Windows (${msg})`);
    } finally {
      setIsLoadingPrinters(false);
    }
  };

  // Check printer health based on active printer mode
  const checkPrinterHealth = async () => {
    setIsCheckingPrinter(true);
    setPrinterError(null);
    setWindowsPrinterStatus(null);

    const res = await printerService.checkHealth(formData);
    setIsCheckingPrinter(false);

    if (formData.printerMode === 'windows-qz') {
      if (res.ready) {
        setQzStatus('connected');
        setWindowsPrinterStatus(res.info || 'QZ Tray siap mencetak otomatis.');
      } else {
        setQzStatus('disconnected');
        setPrinterError(res.error || 'QZ Tray tidak aktif.');
      }
    } else if (formData.printerMode === 'windows-usb') {
      if (res.ready) {
        setWindowsPrinterStatus(res.info || 'Windows Browser Print siap untuk printer iWare IW D260UL.');
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
          formData.printerMode === 'android-bluetooth'
            ? 'Kamera depan ponsel aktif dan siap digunakan'
            : 'Webcam laptop aktif dan siap digunakan'
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
    if (formData.printerMode === 'windows-qz') {
      fetchQZPrinters();
    } else {
      checkPrinterHealth();
    }
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

  // Run Test Print (works for Windows QZ Tray, Windows USB Browser, and Android Cleanter)
  const handleTestPrint = async () => {
    setIsTestPrinting(true);
    setTestPrintMessage(null);

    // Create a compact 576-dot test canvas pattern (72mm at 203 DPI) with zero top margin
    const canvas = document.createElement('canvas');
    canvas.width = formData.rasterDotWidth || 576;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#141E30';
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('=== TEST PRINT KALIBRASI ===', canvas.width / 2, 28);

      ctx.font = 'normal 15px sans-serif';
      const targetPrinterName =
        formData.printerMode === 'windows-qz'
          ? `${formData.qzPrinterName || 'iWare IW D260UL'} (QZ Tray Auto)`
          : formData.printerMode === 'windows-usb'
          ? 'iWare IW D260UL (Windows USB)'
          : 'VSC TM-80D (Android Bluetooth)';
      ctx.fillText(`Target: ${targetPrinterName}`, canvas.width / 2, 58);
      ctx.fillText(`Lebar: ${canvas.width} dots (72 mm) • ${new Date().toLocaleTimeString('id-ID')}`, canvas.width / 2, 85);

      // Calibration ruler test bar
      ctx.fillRect(20, 105, canvas.width - 40, 6);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('|<- 0 mm                       576 dots / 72 mm ->|', canvas.width / 2, 130);

      // Checkerboard calibration pattern
      const size = 14;
      for (let x = 20; x < canvas.width - 20; x += size) {
        for (let y = 145; y < 185; y += size) {
          if (((x / size) + (y / size)) % 2 === 0) {
            ctx.fillRect(x, y, size, size);
          }
        }
      }

      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(
        formData.printerMode === 'windows-qz'
          ? 'STATUS: QZ TRAY AUTO-PRINT OK'
          : formData.printerMode === 'windows-usb'
          ? 'STATUS: WINDOWS BROWSER PRINT OK'
          : 'STATUS: CLEANTER BLUETOOTH OK',
        canvas.width / 2,
        220
      );
    }

    const testDataUrl = canvas.toDataURL('image/png');
    const testBase64 = testDataUrl.replace(/^data:image\/png;base64,/, '');

    const currentPersisted = loadSettings();
    const activeTestSettings: AdminSettings = {
      ...currentPersisted,
      ...formData,
      printerMode: formData.printerMode,
      qzPrinterName: formData.qzPrinterName,
    };

    console.log(
      `[AdminSettingsScreen] Menjalankan Test Print. Mode: "${activeTestSettings.printerMode}", Target: "${activeTestSettings.qzPrinterName}"`
    );

    try {
      setTestPrintMessage(
        formData.printerMode === 'windows-qz'
          ? 'Mengirim ke QZ Tray... (Periksa apakah ada pop-up konfirmasi di Windows)'
          : 'Menyiapkan proses cetak...'
      );

      const res = await printerService.printPhotobox({
        base64Image: testBase64,
        previewUrl: testDataUrl,
        sessionRef: `TEST-${Date.now().toString(36).toUpperCase()}`,
        settings: activeTestSettings,
      });

      if (res.success) {
        if (formData.printerMode === 'windows-qz') {
          setTestPrintMessage(`✅ Test print berhasil terkirim ke "${formData.qzPrinterName || 'iWare'}" via QZ Tray tanpa dialog!`);
        } else if (formData.printerMode === 'windows-usb') {
          setTestPrintMessage('✅ Dialog cetak Windows browser berhasil dibuka untuk printer iWare!');
        } else {
          setTestPrintMessage('✅ Test print berhasil terkirim ke printer via Cleanter!');
        }
      } else {
        const detail = res.errorFix ? ` (${res.errorFix})` : '';
        setTestPrintMessage(`❌ Test print gagal: ${res.errorMessage}${detail}`);
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || String(err);
      setTestPrintMessage(`❌ Kendala saat mengirim ke printer: ${msg}`);
    } finally {
      setIsTestPrinting(false);
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
            Mode Aktif:{' '}
            <span className="font-semibold text-brand-dark">
              {formData.printerMode === 'windows-qz'
                ? 'Windows — Automatic Printing (QZ Tray / iWare)'
                : formData.printerMode === 'windows-usb'
                ? 'Windows USB — Browser Print (iWare)'
                : 'Android Bluetooth — Event (VSC TM-80D)'}
            </span>
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
        {/* PRINTING MODE SELECTOR CARD (Prominently displayed) */}
        <div className="bg-brand-blue-light/50 border-2 border-brand-blue/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-blue" />
              <h3 className="font-extrabold text-brand-dark text-base">Pilih Mode Printer & Perangkat</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-white text-brand-blue border border-blue-200">
              {formData.printerMode === 'windows-qz'
                ? 'Windows QZ Tray Aktif'
                : formData.printerMode === 'windows-usb'
                ? 'Windows USB Aktif'
                : 'Android Bluetooth Aktif'}
            </span>
          </div>
          <p className="text-xs text-brand-muted">
            Hanya satu mode yang aktif dalam satu waktu. Pilih sesuai target perangkat dan printer yang Anda gunakan:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Mode 1: Windows Automatic Printing (QZ Tray) - RECOMMENDED */}
            <button
              type="button"
              onClick={() => handleSelectMode('windows-qz')}
              className={`p-4 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                formData.printerMode === 'windows-qz'
                  ? 'border-brand-blue bg-white shadow-sm ring-2 ring-brand-blue/20'
                  : 'border-brand-border bg-white/70 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-sans">
                    Rekomendasi
                  </span>
                  {formData.printerMode === 'windows-qz' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
                  )}
                </div>
                <span className="font-extrabold text-sm text-brand-dark flex items-center gap-1.5 mb-1">
                  <Zap className="w-4 h-4 text-brand-blue" />
                  <span>Windows QZ Tray (Auto)</span>
                </span>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  • <b>1-Klik Cetak Otomatis</b><br />
                  • Tanpa dialog cetak browser<br />
                  • Target: <b>iWare IW D260UL</b><br />
                  • Kamera: Webcam laptop
                </p>
              </div>
            </button>

            {/* Mode 2: Windows USB — Browser Print */}
            <button
              type="button"
              onClick={() => handleSelectMode('windows-usb')}
              className={`p-4 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                formData.printerMode === 'windows-usb'
                  ? 'border-brand-blue bg-white shadow-sm ring-2 ring-brand-blue/20'
                  : 'border-brand-border bg-white/70 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-sans">
                    Testing Fallback
                  </span>
                  {formData.printerMode === 'windows-usb' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
                  )}
                </div>
                <span className="font-extrabold text-sm text-brand-dark flex items-center gap-1.5 mb-1">
                  <Laptop className="w-4 h-4 text-brand-blue" />
                  <span>Windows USB (Browser)</span>
                </span>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  • Menggunakan dialog <code>window.print()</code><br />
                  • Driver Windows iWare<br />
                  • Tanpa install QZ Tray
                </p>
              </div>
            </button>

            {/* Mode 3: Android Bluetooth — Event */}
            <button
              type="button"
              onClick={() => handleSelectMode('android-bluetooth')}
              className={`p-4 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                formData.printerMode === 'android-bluetooth'
                  ? 'border-brand-blue bg-white shadow-sm ring-2 ring-brand-blue/20'
                  : 'border-brand-border bg-white/70 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-sans">
                    Event Mobile
                  </span>
                  {formData.printerMode === 'android-bluetooth' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
                  )}
                </div>
                <span className="font-extrabold text-sm text-brand-dark flex items-center gap-1.5 mb-1">
                  <Smartphone className="w-4 h-4 text-brand-blue" />
                  <span>Android Bluetooth</span>
                </span>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  • Samsung Galaxy A35<br />
                  • Printer: <b>VSC TM-80D</b><br />
                  • Bridge Cleanter (Port 9100)<br />
                  • Kamera depan selfie (1:1)
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* TAB 1: STATUS & KONEKSI */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            {formData.printerMode === 'windows-qz' ? (
              // WINDOWS QZ TRAY STATUS & CONTROL CARD
              <div className="bg-white border-2 border-brand-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-200">
                      <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-brand-dark">Pencetakan Otomatis QZ Tray</h3>
                      <p className="text-xs text-brand-muted">Direct WebSocket • iWare IW D260UL (80mm Thermal)</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                      qzStatus === 'connected'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : qzStatus === 'checking'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-red-100 text-brand-red border border-red-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        qzStatus === 'connected'
                          ? 'bg-green-600'
                          : qzStatus === 'checking'
                          ? 'bg-blue-600 animate-ping'
                          : 'bg-red-600'
                      }`}
                    />
                    <span>
                      {qzStatus === 'connected'
                        ? 'Terhubung'
                        : qzStatus === 'checking'
                        ? 'Memeriksa...'
                        : 'Terputus'}
                    </span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-brand-border text-sm space-y-3">
                  <div className="flex items-center gap-2 text-brand-dark font-medium text-xs">
                    {qzStatus === 'connected' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    )}
                    <span>{qzStatusMessage || 'Memeriksa status service QZ Tray...'}</span>
                  </div>

                  {/* PRINTER DETECT & SELECT */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                        <Printer className="w-4 h-4 text-brand-blue" />
                        <span>Pilih Printer Windows Terdeteksi:</span>
                      </label>
                      <button
                        type="button"
                        onClick={fetchQZPrinters}
                        disabled={isLoadingPrinters}
                        className="text-xs px-3 py-1 bg-brand-blue-light text-brand-blue font-bold rounded-lg flex items-center gap-1 hover:bg-blue-100 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPrinters ? 'animate-spin' : ''}`} />
                        <span>{isLoadingPrinters ? 'Memindai...' : 'Muat Ulang Printer'}</span>
                      </button>
                    </div>

                    {detectedPrinters.length > 0 ? (
                      <select
                        value={formData.qzPrinterName}
                        onChange={(e) => handleSelectPrinter(e.target.value)}
                        className="w-full h-11 px-3 rounded-lg border border-brand-border bg-white text-sm font-semibold text-brand-dark focus:ring-2 focus:ring-brand-blue/30 focus:outline-none"
                      >
                        {detectedPrinters.map((name) => (
                          <option key={name} value={name}>
                            {name} {/iware|d260|pos-80/i.test(name) ? '★ (Rekomendasi iWare)' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        {isLoadingPrinters
                          ? 'Sedang mencari printer yang terpasang di Windows via QZ Tray...'
                          : 'Belum ada printer yang terdeteksi via QZ Tray. Pastikan QZ Tray berjalan di Windows dan klik "Muat Ulang Printer".'}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-brand-muted whitespace-nowrap">Input Manual:</span>
                      <input
                        type="text"
                        placeholder="Contoh: iWare IW D260UL atau POS-80"
                        value={formData.qzPrinterName}
                        onChange={(e) => handleSelectPrinter(e.target.value)}
                        className="flex-1 h-8 px-2.5 text-xs rounded border border-brand-border"
                      />
                    </div>
                  </div>

                  {/* Quick Setup Checklist */}
                  <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-brand-dark space-y-2">
                    <p className="font-bold text-brand-blue flex items-center gap-1.5">
                      <Command className="w-4 h-4" />
                      <span>Petunjuk Penting 1-Klik Cetak QZ Tray di Windows:</span>
                    </p>
                    <p>1. Pastikan software <b>QZ Tray</b> berjalan di Windows (ikon hijau di taskbar dekat jam).</p>
                    <p>2. Sambungkan kabel USB printer <b>iWare IW D260UL</b> dan nyalakan printer.</p>
                    <p>3. Klik <b>"Muat Ulang Printer"</b> di atas, lalu pilih nama printer iWare Anda.</p>
                    <p>4. Klik <b>"TEST PRINT (QZ TRAY)"</b> di bawah untuk menguji cetak struk otomatis.</p>

                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-1 mt-2">
                      <p className="font-bold flex items-center gap-1">
                        <span>⚠️ JIKA STATUS HANYA "MENGIRIM..." ATAU TERPUTUS:</span>
                      </p>
                      <p>
                        • <b>Pop-up Izin Windows:</b> Periksa taskbar Windows Anda. Jika muncul jendela pop-up otorisasi dari QZ Tray bertuliskan <i>"A website is requesting access..."</i>, centang <b>"Remember this decision"</b> lalu klik <b>"Allow"</b>.
                      </p>
                      <p>
                        • <b>Izin HTTPS / SSL Port 8181:</b> Jika membuka dari link Vercel, buka tab baru ke{' '}
                        <a
                          href="https://localhost:8181"
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-brand-blue underline hover:text-blue-700"
                        >
                          https://localhost:8181 (Klik di sini)
                        </a>
                        , lalu klik <i>Advanced ➔ Proceed to localhost (unsafe)</i> agar Chrome mengizinkan koneksi WSS terenkripsi lokal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={checkPrinterHealth}
                    disabled={isCheckingPrinter}
                    className="px-5 py-3 bg-white border border-brand-border text-brand-dark rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50"
                  >
                    <Wifi className="w-4 h-4 text-brand-blue" />
                    <span>{isCheckingPrinter ? 'Memeriksa...' : 'Cek Status QZ Tray'}</span>
                  </button>

                  <button
                    onClick={handleTestPrint}
                    disabled={isTestPrinting}
                    className="px-5 py-3 bg-brand-blue text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-brand-blue-hover"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isTestPrinting ? 'Mengirim...' : 'TEST PRINT (QZ TRAY)'}</span>
                  </button>
                </div>

                {testPrintMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      testPrintMessage.startsWith('✅')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {testPrintMessage}
                  </div>
                )}
              </div>
            ) : formData.printerMode === 'windows-usb' ? (
              // WINDOWS USB / iWare STATUS CARD
              <div className="bg-white border-2 border-brand-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-brand-dark">Printer Windows USB: iWare IW D260UL</h3>
                    <p className="text-xs text-brand-muted">Thermal Receipt 80mm • ESC/POS Native Driver</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-brand-border text-sm space-y-2">
                  <div className="flex items-center gap-2 text-green-700 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>{windowsPrinterStatus || 'Windows Browser Print Siap'}</span>
                  </div>
                  <p className="text-xs text-brand-muted">
                    Mencetak langsung melalui driver Windows tanpa memerlukan bridge lokal Cleanter atau koneksi Bluetooth.
                  </p>

                  <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs text-brand-dark space-y-2 mt-2">
                    <p className="font-semibold text-brand-blue flex items-center gap-1.5">
                      <Command className="w-4 h-4" />
                      <span>Petunjuk Setup Windows & iWare IW D260UL:</span>
                    </p>
                    <p>1. Tancapkan kabel USB printer iWare ke laptop Windows Anda dan nyalakan printer.</p>
                    <p>2. Pastikan driver iWare IW D260UL terpasang di <i>Settings ➔ Printers & Scanners</i> dan jadikan sebagai default printer.</p>
                    <p>3. Di dialog cetak Chrome, pilih ukuran kertas <b>80mm Roll</b>, Margins: <b>None</b>, dan hilangkan centang <b>Headers & footers</b>.</p>
                    <div className="p-2 bg-blue-50/70 rounded border border-blue-200 text-[11px] text-brand-blue font-medium">
                      💡 <b>Dukungan Kiosk Otomatis:</b> Jalankan Chrome dengan parameter <code>--kiosk-printing</code> untuk mencetak langsung tanpa dialog browser.
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={checkPrinterHealth}
                    className="px-5 py-3 bg-brand-blue text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-brand-blue-hover"
                  >
                    <Wifi className="w-4 h-4" />
                    <span>Uji Status Printer Windows</span>
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

            {/* PRINTER DEBUG DIAGNOSTICS PANEL (Requirement 5) */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4 font-mono text-xs border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-sm tracking-wide text-slate-100 font-sans">
                    Diagnostik Printer Kiosk (Admin Debug)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  Routing: Strict Isolated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mode Aktif</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                    {formData.printerMode === 'windows-qz' ? (
                      <span className="text-emerald-400 font-bold">windows-qz (QZ Tray)</span>
                    ) : formData.printerMode === 'windows-usb' ? (
                      <span className="text-blue-400 font-bold">windows-usb (Browser)</span>
                    ) : (
                      <span className="text-purple-400 font-bold">android-bluetooth (Cleanter)</span>
                    )}
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Printer Terpilih</span>
                  <span className="text-xs font-bold text-white truncate block">
                    {formData.printerMode === 'windows-qz'
                      ? formData.qzPrinterName || '(Belum dipilih)'
                      : formData.printerMode === 'windows-usb'
                      ? 'iWare IW D260UL (Driver Windows)'
                      : 'VSC TM-80D (Bluetooth)'}
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Adapter Terpasang</span>
                  <span className="text-xs font-medium text-slate-200">
                    {printerService.getAdapter(formData.printerMode).name}
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Port & Protokol</span>
                  <span className="text-xs font-medium text-slate-200">
                    {formData.printerMode === 'windows-qz'
                      ? 'WSS Port 8181 (Auto cycle 8282-8484)'
                      : formData.printerMode === 'windows-usb'
                      ? 'Native Browser window.print()'
                      : 'HTTP Port 9100 Cleanter'}
                  </span>
                </div>
              </div>

              {/* Strict Isolation Notice */}
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <span className="text-amber-400">🛡️ Kebijakan Isolasi Cetak:</span>
                </div>
                <p>
                  {formData.printerMode === 'windows-qz'
                    ? '• window.print() DILARANG TOTAL. Hanya QZ Tray qz.print() yang dieksekusi.'
                    : formData.printerMode === 'windows-usb'
                    ? '• Menggunakan window.print() browser dialog untuk driver Windows iWare.'
                    : '• Menggunakan HTTP bridge Cleanter ke printer VSC TM-80D.'}
                </p>
              </div>

              {/* Last Print Diagnostic Log */}
              {(() => {
                const lastDiag = printerService.getLastDiagnostics();
                if (!lastDiag) {
                  return (
                    <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 italic">
                      Belum ada aktivitas cetak pada sesi ini. Klik "TEST PRINT (QZ TRAY)" di atas untuk memverifikasi jalur printer.
                    </div>
                  );
                }
                return (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Log Eksekusi Terakhir ({lastDiag.timestamp}):</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          lastDiag.status === 'success'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : lastDiag.status === 'error'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {lastDiag.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-200 text-xs font-semibold">{lastDiag.message}</p>
                    {lastDiag.detail && (
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Detail: {lastDiag.detail}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Hardware & PWA Status */}
            <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-brand-dark">Kesiapan Hardware & Offline PWA</h3>

              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-xl bg-gray-50 border border-brand-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-brand-blue" />
                    <div>
                      <p className="font-bold text-brand-dark">
                        {formData.printerMode === 'windows-usb' ? 'Webcam Laptop Windows' : 'Kamera Depan Ponsel'}
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
                Unggah gambar berformat <b>PNG dengan background transparan</b>. Ukuran optimal adalah <b>1080 × 1080 piksel (1:1)</b>. Bagian tengah harus bolong/transparan agar wajah pengunjung terlihat. Aset tersimpan permanen di IndexedDB dan dapat digunakan offline.
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

        {/* TAB 3: PENGATURAN CETAK & KALIBRASI */}
        {activeTab === 'print' && (
          <div className="space-y-6">
            {/* Test Print Section */}
            <div className="bg-brand-blue-light/50 border border-blue-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-brand-dark">
                    Uji Cetak Kalibrasi ({formData.printerMode === 'windows-qz' ? (formData.qzPrinterName || 'iWare IW D260UL (QZ Tray)') : formData.printerMode === 'windows-usb' ? 'iWare IW D260UL (Browser)' : 'VSC TM-80D'})
                  </h3>
                  <p className="text-xs text-brand-muted">
                    {formData.printerMode === 'windows-qz'
                      ? 'Kirimkan sampel pola kalibrasi langsung via QZ Tray tanpa dialog cetak browser'
                      : formData.printerMode === 'windows-usb'
                      ? 'Membuka dialog cetak Windows dengan struk kalibrasi 80mm'
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

            {/* Print Parameters Calibration */}
            <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-base text-brand-dark">Kalibrasi Ukuran Kertas & Cetakan</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {formData.printerMode === 'windows-usb' || formData.printerMode === 'windows-qz' ? (
                  <>
                    <div>
                      <label className="block font-semibold text-brand-dark mb-1">Lebar Kertas Fisik (mm)</label>
                      <select
                        value={formData.windowsPaperWidthMm}
                        onChange={(e) => setFormData({ ...formData, windowsPaperWidthMm: Number(e.target.value) })}
                        className="w-full h-12 px-3 rounded-xl border border-brand-border font-medium bg-white"
                      >
                        <option value={80}>80 mm (Standar iWare IW D260UL)</option>
                        <option value={58}>58 mm (Roll Mini)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-brand-dark mb-1">Lebar Cetak Efektif (Printable mm)</label>
                      <input
                        type="number"
                        min="50"
                        max="80"
                        value={formData.windowsPrintableWidthMm}
                        onChange={(e) => setFormData({ ...formData, windowsPrintableWidthMm: Number(e.target.value) })}
                        className="w-full h-12 px-3 rounded-xl border border-brand-border"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-brand-dark mb-1">Tinggi Halaman Driver (mm)</label>
                      <input
                        type="number"
                        min="90"
                        max="300"
                        value={formData.windowsPageHeightMm}
                        onChange={(e) => setFormData({ ...formData, windowsPageHeightMm: Number(e.target.value) })}
                        className="w-full h-12 px-3 rounded-xl border border-brand-border"
                      />
                      <p className="text-[11px] text-brand-muted mt-0.5">Awal: 120 mm (Dapat disesuaikan jika driver membatasi panjang)</p>
                    </div>

                    <div>
                      <label className="block font-semibold text-brand-dark mb-1">Margin Dokumen Cetak (mm)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.windowsMarginMm}
                        onChange={(e) => setFormData({ ...formData, windowsMarginMm: Number(e.target.value) })}
                        className="w-full h-12 px-3 rounded-xl border border-brand-border"
                      />
                      <p className="text-[11px] text-brand-muted mt-0.5">Rekomendasi: 0 mm agar tidak memicu halaman kedua</p>
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
                  <label className="block font-semibold text-brand-dark mb-1">Lebar Raster Titik (Dots / Px)</label>
                  <select
                    value={formData.rasterDotWidth}
                    onChange={(e) => setFormData({ ...formData, rasterDotWidth: Number(e.target.value) })}
                    className="w-full h-12 px-3 rounded-xl border border-brand-border font-medium bg-white"
                  >
                    <option value={576}>576 dots (Standar iWare & VSC 72mm)</option>
                    <option value={512}>512 dots</option>
                    <option value={640}>640 dots</option>
                    <option value={384}>384 dots (58mm)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-brand-dark mb-1">
                    Tinggi Header Struk: {formData.headerHeight} px
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="180"
                    step="5"
                    value={formData.headerHeight}
                    onChange={(e) => setFormData({ ...formData, headerHeight: Number(e.target.value) })}
                    className="w-full accent-brand-blue"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-dark mb-1">
                    Tinggi Footer Struk: {formData.footerHeight} px
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="180"
                    step="5"
                    value={formData.footerHeight}
                    onChange={(e) => setFormData({ ...formData, footerHeight: Number(e.target.value) })}
                    className="w-full accent-brand-blue"
                  />
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
                      <label className="block font-semibold mb-1">Garis Feed Spacing (Jarak Keluar)</label>
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

            {/* OPSI & SECURITY QZ TRAY */}
            {formData.printerMode === 'windows-qz' && (
              <div className="bg-white border border-brand-border rounded-2xl p-5 space-y-4 shadow-sm text-sm">
                <div className="flex items-center gap-2 text-brand-dark">
                  <Zap className="w-5 h-5 text-brand-blue" />
                  <h3 className="font-bold text-base">Opsi Mesin Cetak QZ Tray (iWare)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Metode Pengiriman Gambar</label>
                    <select
                      value={formData.qzUseRawEscpos ? 'raw' : 'driver'}
                      onChange={(e) => setFormData({ ...formData, qzUseRawEscpos: e.target.value === 'raw' })}
                      className="w-full h-10 px-3 rounded-lg border border-brand-border bg-white font-medium"
                    >
                      <option value="raw">Raw ESC/POS Direct (0mm Margin / Tanpa Spasi Atas) — Rekomendasi iWare</option>
                      <option value="driver">Driver Windows (Pixel / Raster Spooler)</option>
                    </select>
                    <p className="text-[11px] text-brand-muted mt-1">
                      {formData.qzUseRawEscpos
                        ? '⚡ Raw ESC/POS: Mencetak langsung dari baris 0 hardware printer thermal tanpa margin atas driver Windows (paling hemat kertas).'
                        : 'Driver Windows Spooler: Menggunakan layout driver Windows (dapat menyisakan spasi atas jika ukuran kertas driver belum diubah).'}
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Auto Feed & Potong Kertas (Cut)</label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="qzFeedAndCut"
                        checked={formData.qzFeedAndCut}
                        onChange={(e) => setFormData({ ...formData, qzFeedAndCut: e.target.checked })}
                        className="w-5 h-5 accent-brand-blue rounded"
                      />
                      <label htmlFor="qzFeedAndCut" className="text-xs text-brand-dark cursor-pointer font-medium">
                        Kirim perintah feed kertas & auto-cut setelah foto selesai
                      </label>
                    </div>
                  </div>
                </div>

                {/* Silent Printing & Security */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-brand-blue" />
                    <h4 className="font-bold text-xs text-brand-dark uppercase tracking-wide">
                      Bebas Dialog Konfirmasi (Silent Printing Otomatis)
                    </h4>
                  </div>

                  <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-brand-dark space-y-2 mb-3">
                    <p className="font-bold text-blue-900 flex items-center gap-1.5">
                      <span>🔒</span> Sertifikat Digital "PHOTOBOX KIOSK" Sudah Terpasang
                    </p>
                    <p className="text-blue-950">
                      Sertifikat digital X.509 dan penandatangan otomatis RSA-SHA512 telah diintegrasikan langsung ke aplikasi browser ini.
                    </p>
                    <div className="bg-white p-2.5 rounded-lg border border-blue-200 text-blue-900 font-medium">
                      <p className="font-bold text-blue-800 mb-1">Cara Mengaktifkan Cetak 1-Klik Tanpa Dialog:</p>
                      <ol className="list-decimal list-inside space-y-1 text-[11px]">
                        <li>Saat dialog izin QZ Tray muncul di Windows, centang <b>"Remember this decision"</b> (sekarang tombol "Allow" tetap aktif & bisa diklik).</li>
                        <li>Klik tombol <b>"Allow"</b>.</li>
                        <li>Selesai! Izin tersimpan permanen di Windows dan dialog tidak akan pernah muncul lagi.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Digital Certificate URL (Opsional)</label>
                      <input
                        type="text"
                        placeholder="http://localhost:8190/cert atau kosongkan"
                        value={formData.qzCertificateUrl}
                        onChange={(e) => setFormData({ ...formData, qzCertificateUrl: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-brand-border"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Signature Endpoint URL (Opsional)</label>
                      <input
                        type="text"
                        placeholder="http://localhost:8190/sign atau kosongkan"
                        value={formData.qzSignatureEndpoint}
                        onChange={(e) => setFormData({ ...formData, qzSignatureEndpoint: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-brand-border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                    <p className="text-[11px] text-brand-muted">Mencegah layar laptop/ponsel redup saat kiosk aktif.</p>
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
