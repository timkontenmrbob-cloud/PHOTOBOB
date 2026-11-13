import React, { useState } from 'react';
import { Printer, RotateCcw, RefreshCw } from 'lucide-react';
import { usePhotobox } from '../context/PhotoboxContext';
import { Header } from '../components/Header';

export const PhotoPreviewScreen: React.FC = () => {
  const {
    session,
    isComposing,
    printPhoto,
    retakePhoto,
  } = usePhotobox();

  const [showThermalView, setShowThermalView] = useState(true);

  const previewSrc = showThermalView
    ? session.composedPreviewUrl || session.capturedPhotoUrl
    : session.composedPreviewUrl || session.capturedPhotoUrl;

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-dark">
      <Header />

      <main className="flex-1 px-4 sm:px-6 max-w-md mx-auto w-full py-4 flex flex-col items-center justify-between">
        {/* Title & Instruction */}
        <div className="text-center mb-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight mb-1">
            Foto Kamu Sudah Jadi!
          </h1>
          <p className="text-[17px] text-brand-muted">
            Sudah suka dengan hasilnya?
          </p>
        </div>

        {/* Receipt Container Preview */}
        <div className="w-full max-w-[320px] flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl shadow-md border-2 border-brand-border p-3 overflow-hidden relative transition-all">
            {isComposing || !session.composedPrintBase64 ? (
              <div className="aspect-[3/4] w-full flex flex-col items-center justify-center gap-3 bg-brand-blue-light/50 rounded-xl">
                <RefreshCw className="w-10 h-10 text-brand-blue animate-spin" />
                <p className="text-base font-semibold text-brand-dark">Menyiapkan cetakan...</p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {/* Simulated thermal receipt paper border */}
                <div className="w-full bg-[#FCFCFD] rounded-lg border border-gray-200 overflow-hidden shadow-inner">
                  {previewSrc && (
                    <img
                      src={previewSrc}
                      alt="Hasil Foto Photobox"
                      className="w-full h-auto object-contain block"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Toggle Simulated Thermal / Original View */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setShowThermalView((prev) => !prev)}
              className="text-xs px-3 py-1.5 rounded-full bg-brand-blue-light text-brand-blue font-medium hover:bg-blue-100 transition-colors"
            >
              {showThermalView ? '📄 Tampilan Kertas Thermal' : '🎨 Tampilan Standar'}
            </button>
          </div>
        </div>

        <div className="h-2" />
      </main>

      {/* Bottom Sticky Action Area with Two Distinct Buttons */}
      <footer className="w-full p-6 pb-8 bg-white border-t border-brand-border max-w-md mx-auto flex flex-col gap-3">
        {/* Primary Blue Action: CETAK FOTO */}
        <button
          onClick={printPhoto}
          disabled={isComposing || !session.composedPrintBase64 || session.hasPrinted}
          className="w-full h-[64px] bg-brand-blue hover:bg-brand-blue-hover active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-[20px] rounded-2xl flex items-center justify-center gap-3 transition-all duration-150 shadow-sm"
        >
          <Printer className="w-6 h-6 stroke-[2.2]" />
          <span>CETAK FOTO</span>
        </button>

        {/* Secondary White Button: FOTO LAGI */}
        <button
          onClick={retakePhoto}
          disabled={isComposing}
          className="w-full h-[60px] bg-white hover:bg-gray-50 active:bg-gray-100 text-brand-dark font-semibold text-[18px] rounded-2xl flex items-center justify-center gap-3 transition-colors border-2 border-brand-border shadow-sm"
        >
          <RotateCcw className="w-5 h-5 text-brand-muted" />
          <span>FOTO LAGI</span>
        </button>
      </footer>
    </div>
  );
};
