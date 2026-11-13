import React from 'react';
import { Printer, AlertTriangle, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { usePhotobox } from '../context/PhotoboxContext';
import { Header } from '../components/Header';

export const PrintingScreen: React.FC = () => {
  const {
    session,
    settings,
    printPhoto,
    confirmDesktopPrintSuccess,
    retryDesktopPrint,
    setScreen,
  } = usePhotobox();

  const isError = session.printStatus === 'error';
  const isConfirming = session.printStatus === 'confirming';

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-dark">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full text-center py-8">
        {/* 1. CONFIRMATION STATE FOR DESKTOP BROWSER PRINTING */}
        {isConfirming ? (
          <div className="flex flex-col items-center animate-fadeIn">
            {/* Visual Icon */}
            <div className="w-28 h-28 rounded-3xl bg-brand-blue-light flex items-center justify-center mb-6 border border-blue-200">
              <Printer className="w-14 h-14 text-brand-blue stroke-[1.8]" />
            </div>

            {/* Heading & Subtitle */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight mb-2">
              Konfirmasi Hasil Cetak
            </h1>
            <p className="text-[18px] leading-relaxed text-brand-muted max-w-xs mb-6">
              Apakah struk foto berhasil keluar dari printer{' '}
              <span className="font-semibold text-brand-dark">
                {settings.printerMode === 'desktop-usb' ? 'USB (iWare)' : 'Thermal'}
              </span>
              ?
            </p>

            <div className="p-4 rounded-2xl bg-gray-50 border border-brand-border text-xs text-brand-muted text-left w-full space-y-1 mb-4">
              <p className="font-semibold text-brand-dark">Catatan Petugas:</p>
              <p>• Jika struk telah keluar sempurna, ketuk <b>"Ya, Berhasil Dicetak"</b> untuk menyelesaikan sesi.</p>
              <p>• Jika kertas macet atau belum tercetak, ketuk <b>"Belum / Cetak Ulang"</b>.</p>
            </div>
          </div>
        ) : !isError ? (
          // 2. ACTIVE PRINTING STATE
          <div className="flex flex-col items-center">
            {/* Animated Printer Icon Container */}
            <div className="relative mb-8">
              <div className="w-28 h-28 rounded-3xl bg-brand-blue-light flex items-center justify-center border border-blue-100">
                <Printer className="w-14 h-14 text-brand-blue animate-pulse stroke-[1.8]" />
              </div>
              <div className="absolute -inset-2 border-2 border-brand-blue/30 border-t-brand-blue rounded-[28px] animate-spin" />
            </div>

            {/* Heading & Subtitle */}
            <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight mb-3">
              Foto Sedang Dicetak
            </h1>
            <p className="text-[19px] leading-relaxed text-brand-muted max-w-xs mb-8">
              Mohon tunggu sebentar, ya. Printer sedang memproses fotomu.
            </p>

            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-blue-light text-brand-blue font-semibold text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-ping" />
              <span>
                {settings.printerMode === 'desktop-usb'
                  ? 'Membuka dialog cetak USB...'
                  : 'Mengirim data ke VSC TM-80D...'}
              </span>
            </div>
          </div>
        ) : (
          // 3. ERROR STATE
          <div className="flex flex-col items-center">
            {/* Warning Icon */}
            <div className="w-24 h-24 rounded-3xl bg-brand-red-light flex items-center justify-center mb-6 border border-red-200">
              <AlertTriangle className="w-12 h-12 text-brand-red stroke-[2]" />
            </div>

            {/* Heading & Subtitle */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight mb-2">
              Printer Sedang Bermasalah
            </h1>
            <p className="text-[18px] text-brand-muted max-w-xs mb-6">
              Silakan panggil petugas untuk membantu.
            </p>

            {/* Error Message Box */}
            <div className="w-full bg-gray-50 border border-brand-border rounded-2xl p-4 text-left mb-6">
              <p className="text-sm font-semibold text-brand-dark mb-1">
                Keterangan Kendala:
              </p>
              <p className="text-sm text-brand-muted">
                {session.printErrorMessage || 'Printer tidak merespons.'}
              </p>
              {session.printErrorFix && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-brand-blue font-medium">
                  Saran: {session.printErrorFix}
                </div>
              )}
            </div>

            <p className="text-xs text-brand-muted">
              Fotomu tetap tersimpan aman dan tidak hilang.
            </p>
          </div>
        )}
      </main>

      {/* Action Footer */}
      {isConfirming ? (
        <footer className="w-full p-6 pb-8 bg-white border-t border-brand-border max-w-md mx-auto flex flex-col gap-3">
          {/* Primary Confirmation Button */}
          <button
            onClick={confirmDesktopPrintSuccess}
            className="w-full h-[64px] bg-brand-blue hover:bg-brand-blue-hover active:scale-[0.98] text-white font-semibold text-[20px] rounded-2xl flex items-center justify-center gap-3 transition-all duration-150 shadow-sm"
          >
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            <span>Ya, Berhasil Dicetak</span>
          </button>

          {/* Retry / Return to Photo */}
          <button
            onClick={retryDesktopPrint}
            className="w-full h-[52px] bg-white hover:bg-gray-50 active:bg-gray-100 text-brand-dark font-semibold text-[17px] rounded-xl flex items-center justify-center gap-2 transition-colors border border-brand-border"
          >
            <RefreshCw className="w-4 h-4 text-brand-muted" />
            <span>Belum / Cetak Ulang</span>
          </button>
        </footer>
      ) : isError ? (
        <footer className="w-full p-6 pb-8 bg-white border-t border-brand-border max-w-md mx-auto flex flex-col gap-3">
          <button
            onClick={printPhoto}
            className="w-full h-[64px] bg-brand-blue hover:bg-brand-blue-hover active:scale-[0.98] text-white font-semibold text-[20px] rounded-2xl flex items-center justify-center gap-3 transition-all duration-150 shadow-sm"
          >
            <RefreshCw className="w-5 h-5 stroke-[2.2]" />
            <span>Coba Cetak Lagi</span>
          </button>

          <button
            onClick={() => setScreen('preview')}
            className="w-full h-[52px] bg-white hover:bg-gray-50 active:bg-gray-100 text-brand-muted font-semibold text-[17px] rounded-xl flex items-center justify-center gap-2 transition-colors border border-transparent"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Foto</span>
          </button>
        </footer>
      ) : null}
    </div>
  );
};
