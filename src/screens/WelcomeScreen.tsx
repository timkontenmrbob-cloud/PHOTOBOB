import React from 'react';
import { Camera, ArrowRight } from 'lucide-react';
import { usePhotobox } from '../context/PhotoboxContext';
import { Header } from '../components/Header';

export const WelcomeScreen: React.FC = () => {
  const { startVisitorSession } = usePhotobox();

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-dark">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full text-center py-8">
        {/* Large Minimal Blue Camera Icon */}
        <div className="w-28 h-28 rounded-3xl bg-brand-blue-light flex items-center justify-center mb-8 border border-blue-100">
          <Camera className="w-14 h-14 text-brand-blue stroke-[1.8]" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight mb-3">
          Yuk, Foto Dulu!
        </h1>

        {/* Subtitle */}
        <p className="text-[19px] leading-relaxed text-brand-muted max-w-xs mb-10">
          Pilih bingkai, ambil foto, lalu cetak kenanganmu.
        </p>

        {/* Instruction Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue-light text-brand-blue font-medium text-base mb-8">
          <span>✨</span>
          <span>Gratis 1 Lembar Cetak Thermal</span>
        </div>
      </main>

      {/* Bottom Sticky Action Area */}
      <footer className="w-full p-6 pb-8 bg-white border-t border-brand-border max-w-md mx-auto">
        <button
          onClick={startVisitorSession}
          className="w-full h-[64px] bg-brand-blue hover:bg-brand-blue-hover active:scale-[0.98] text-white font-semibold text-[20px] rounded-2xl flex items-center justify-center gap-3 transition-all duration-150 shadow-sm"
        >
          <span>MULAI FOTO</span>
          <ArrowRight className="w-6 h-6 stroke-[2.2]" />
        </button>
      </footer>
    </div>
  );
};
