import React from 'react';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { usePhotobox } from '../context/PhotoboxContext';
import { Header } from '../components/Header';

export const FrameSelectionScreen: React.FC = () => {
  const {
    frames,
    selectedFrame,
    selectFrame,
    proceedToCamera,
    resetToWelcome,
  } = usePhotobox();

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-dark">
      <Header />

      <main className="flex-1 px-6 max-w-md mx-auto w-full py-6 flex flex-col">
        {/* Title & Instruction */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight mb-2">
            Pilih Bingkai Foto
          </h1>
          <p className="text-[18px] text-brand-muted">
            Pilih satu bingkai yang kamu suka.
          </p>
        </div>

        {/* 3 Selectable Frame Cards */}
        <div className="flex-1 flex flex-col gap-4 justify-center py-2">
          {frames.map((frame, index) => {
            const isSelected = selectedFrame.id === frame.id;
            const previewUrl = frame.customDataUrl || frame.defaultUrl;

            return (
              <button
                key={frame.id}
                onClick={() => selectFrame(frame.id)}
                className={`w-full p-3 rounded-2xl flex items-center gap-4 transition-all duration-150 text-left relative ${
                  isSelected
                    ? 'border-2 border-brand-blue bg-brand-blue-light/40 shadow-sm'
                    : 'border border-brand-border bg-white hover:border-gray-300'
                }`}
              >
                {/* Frame Thumbnail Preview */}
                <div className="w-20 aspect-[3/4] sm:w-24 rounded-xl border border-brand-border bg-slate-50 flex items-center justify-center p-1 overflow-hidden relative shrink-0">
                  <div className="w-full h-full bg-white rounded flex items-center justify-center relative overflow-hidden">
                    <span className="absolute left-[5.555556%] top-[6.25%] w-[88.888889%] aspect-square bg-slate-200/50 flex items-center justify-center text-[11px] text-brand-muted font-medium">Foto 1:1</span>
                    <img
                      src={previewUrl}
                      alt={frame.name}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                </div>

                {/* Frame Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[19px] font-bold text-brand-dark">
                      {frame.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-brand-muted font-medium">
                      {frame.styleName}
                    </span>
                  </div>
                  <p className="text-sm text-brand-muted mt-0.5">
                    {index === 0
                      ? 'Polaroid putih, ruang tulisan di bawah'
                      : index === 1
                      ? 'Gaya klasik retro film'
                      : 'Gaya ceria bintang & polkadot'}
                  </p>
                </div>

                {/* Selection Checkmark Indicator */}
                <div className="pr-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-brand-blue text-white'
                        : 'border border-brand-border bg-white text-transparent'
                    }`}
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom Sticky Action Area */}
      <footer className="w-full p-6 pb-8 bg-white border-t border-brand-border max-w-md mx-auto flex flex-col gap-3">
        <button
          onClick={proceedToCamera}
          className="w-full h-[64px] bg-brand-blue hover:bg-brand-blue-hover active:scale-[0.98] text-white font-semibold text-[20px] rounded-2xl flex items-center justify-center gap-3 transition-all duration-150 shadow-sm"
        >
          <span>LANJUT FOTO</span>
          <ArrowRight className="w-6 h-6 stroke-[2.2]" />
        </button>

        <button
          onClick={resetToWelcome}
          className="w-full h-[52px] bg-white hover:bg-gray-50 active:bg-gray-100 text-brand-muted font-semibold text-[17px] rounded-xl flex items-center justify-center gap-2 transition-colors border border-transparent"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Awal</span>
        </button>
      </footer>
    </div>
  );
};
