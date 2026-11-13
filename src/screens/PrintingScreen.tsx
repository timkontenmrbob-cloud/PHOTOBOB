import React, { useState } from 'react';
import {
  Printer,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { usePhotobox } from '../context/PhotoboxContext';
import { Header } from '../components/Header';
import { AdminPinModal } from '../components/AdminPinModal';

export const PrintingScreen: React.FC = () => {
  const {
    session,
    settings,
    printPhoto,
    confirmDesktopPrintSuccess,
    retryDesktopPrint,
    setScreen,
  } = usePhotobox();

  const [isStaffAssistanceOpen, setIsStaffAssistanceOpen] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);

  const isError = session.printStatus === 'error';
  const isConfirming = session.printStatus === 'confirming';

  // Handler when visitor taps "BELUM, PANGGIL PETUGAS"
  const handleReportUncertainPrint = () => {
    setIsStaffAssistanceOpen(true);
  };

  // Handler when admin PIN succeeds
  const handleAdminAuthSuccess = () => {
    setIsAdminPinModalOpen(false);
    setIsAdminAuthorized(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-dark">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full text-center py-8">
        {/* 1. ADMIN ASSISTANCE RECOVERY STATE (When visitor tapped 'BELUM, PANGGIL PETUGAS') */}
        {isStaffAssistanceOpen ? (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="w-24 h-24 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-6 text-amber-600">
              <ShieldAlert className="w-12 h-12 stroke-[2]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight mb-2">
              Bantuan Petugas
            </h1>
            <p className="text-[18px] text-brand-muted max-w-xs mb-6">
              Fotomu tetap tersimpan aman. Silakan panggil petugas photobox untuk memeriksa printer.
            </p>

            <div className="p-4 rounded-2xl bg-gray-50 border border-brand-border text-xs text-brand-muted text-left w-full space-y-1 mb-6">
              <p className="font-semibold text-brand-dark">Proteksi Anti-Cetak Ganda Aktif:</p>
              <p>• Cetak otomatis dinonaktifkan demi mencegah pemborosan kertas.</p>
              <p>• Hanya petugas resmi yang dapat mengotorisasi cetak ulang setelah mengecek kabel & kertas printer.</p>
            </div>

            {isAdminAuthorized ? (
              <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left mb-6 space-y-2">
                <p className="text-xs font-bold text-brand-blue flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Akses Petugas Diberikan</span>
                </p>
                <p className="text-xs text-brand-dark">
                  Silakan periksa printer{' '}
                  <span className="font-semibold">
                    {settings.printerMode === 'windows-qz'
                      ? (settings.qzPrinterName || 'iWare IW D260UL')
                      : settings.printerMode === 'windows-usb'
                      ? 'iWare IW D260UL'
                      : 'VSC TM-80D'}
                  </span>{' '}
                  (lampu error, ketersediaan roll kertas, dan kabel data), lalu tentukan tindakan:
                </p>
              </div>
            ) : null}
          </div>
        ) : isConfirming ? (
          // 2. CONFIRMATION STATE FOR PHYSICAL PRINTING (Per prompt: "Apakah foto sudah tercetak?")
          <div className="flex flex-col items-center animate-fadeIn">
            {/* Visual Icon */}
            <div className="w-28 h-28 rounded-3xl bg-brand-blue-light flex items-center justify-center mb-6 border border-blue-200">
              <Printer className="w-14 h-14 text-brand-blue stroke-[1.8]" />
            </div>

            {/* Exact Heading from Specification */}
            <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight mb-3">
              Apakah foto sudah tercetak?
            </h1>
            <p className="text-[18px] leading-relaxed text-brand-muted max-w-xs mb-6">
              Periksa mulut printer{' '}
              <span className="font-semibold text-brand-dark">
                {settings.printerMode === 'windows-qz'
                  ? (settings.qzPrinterName || 'iWare IW D260UL')
                  : settings.printerMode === 'windows-usb'
                  ? 'iWare USB'
                  : 'VSC TM-80D'}
              </span>
              . Apakah struk foto telah keluar?
            </p>

            <div className="p-4 rounded-2xl bg-gray-50 border border-brand-border text-xs text-brand-muted text-left w-full space-y-1 mb-4">
              <p className="font-semibold text-brand-dark">Petunjuk:</p>
              <p>• Tekan <b>"YA, SUDAH TERCETAK"</b> jika kertas struk sudah keluar rapi.</p>
              <p>• Tekan <b>"BELUM, PANGGIL PETUGAS"</b> jika kertas belum keluar atau terjadi kendala.</p>
            </div>
          </div>
        ) : !isError ? (
          // 3. ACTIVE PRINTING STATE
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
                {settings.printerMode === 'windows-qz'
                  ? `Mengirim cetak otomatis ke ${settings.qzPrinterName || 'iWare IW D260UL'} via QZ Tray...`
                  : settings.printerMode === 'windows-usb'
                  ? 'Membuka dialog cetak iWare USB...'
                  : 'Mengirim data ke VSC TM-80D...'}
              </span>
            </div>
          </div>
        ) : (
          // 4. ERROR STATE
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
            <div className="w-full max-w-full overflow-hidden bg-gray-50 border border-brand-border rounded-2xl p-4 text-left mb-6">
              <p className="text-sm font-semibold text-brand-dark mb-1">
                Keterangan Kendala:
              </p>
              <p className="text-sm text-brand-muted break-words break-all">
                {session.printErrorMessage || 'Printer tidak merespons.'}
              </p>
              {session.printErrorFix && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-brand-blue font-medium break-words break-all">
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
      {isStaffAssistanceOpen ? (
        <footer className="w-full p-6 pb-8 bg-white border-t border-brand-border max-w-md mx-auto flex flex-col gap-3">
          {!isAdminAuthorized ? (
            <button
              onClick={() => setIsAdminPinModalOpen(true)}
              className="w-full h-[64px] bg-brand-blue hover:bg-brand-blue-hover active:scale-[0.98] text-white font-semibold text-[19px] rounded-2xl flex items-center justify-center gap-3 shadow-sm transition-all"
            >
              <Lock className="w-5 h-5" />
              <span>Otorisasi Petugas (PIN)</span>
            </button>
          ) : (
            <>
              {/* Authorized Admin Actions */}
              <button
                onClick={() => {
                  setIsStaffAssistanceOpen(false);
                  setIsAdminAuthorized(false);
                  printPhoto();
                }}
                className="w-full h-[62px] bg-brand-blue hover:bg-brand-blue-hover active:scale-[0.98] text-white font-semibold text-[19px] rounded-2xl flex items-center justify-center gap-3 shadow-sm transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Cetak Ulang Struk</span>
              </button>

              <button
                onClick={() => {
                  setIsStaffAssistanceOpen(false);
                  setIsAdminAuthorized(false);
                  retryDesktopPrint();
                }}
                className="w-full h-[52px] bg-white hover:bg-gray-50 text-brand-dark font-semibold text-[17px] rounded-xl flex items-center justify-center gap-2 border border-brand-border"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali ke Layar Foto</span>
              </button>
            </>
          )}
        </footer>
      ) : isConfirming ? (
        <footer className="w-full p-6 pb-8 bg-white border-t border-brand-border max-w-md mx-auto flex flex-col gap-3">
          {/* Primary Action from Spec: YA, SUDAH TERCETAK */}
          <button
            onClick={confirmDesktopPrintSuccess}
            className="w-full h-[64px] bg-brand-blue hover:bg-brand-blue-hover active:scale-[0.98] text-white font-semibold text-[20px] rounded-2xl flex items-center justify-center gap-3 transition-all duration-150 shadow-sm"
          >
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            <span>YA, SUDAH TERCETAK</span>
          </button>

          {/* Secondary Action from Spec: BELUM, PANGGIL PETUGAS */}
          <button
            onClick={handleReportUncertainPrint}
            className="w-full h-[56px] bg-white hover:bg-gray-50 active:bg-gray-100 text-brand-muted font-semibold text-[17px] rounded-xl flex items-center justify-center gap-2 transition-colors border-2 border-brand-border"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>BELUM, PANGGIL PETUGAS</span>
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

      {/* Admin PIN Gate for Staff Assistance Authorization */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />
    </div>
  );
};
