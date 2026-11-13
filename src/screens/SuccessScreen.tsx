import React, { useEffect, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePhotobox } from '../context/PhotoboxContext';
import { Header } from '../components/Header';

export const SuccessScreen: React.FC = () => {
  const { settings, resetToWelcome } = usePhotobox();
  const totalSeconds = settings.autoResetSeconds || 8;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1769E0', '#4B88E8', '#99C0FF', '#141E30'],
      });
    } catch (e) {
      console.log('Confetti failed to run', e);
    }

    // Countdown interval
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          resetToWelcome();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resetToWelcome]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-dark">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full text-center py-8">
        {/* Simple Blue Checkmark Icon */}
        <div className="w-28 h-28 rounded-full bg-brand-blue flex items-center justify-center mb-8 shadow-md">
          <Check className="w-16 h-16 text-white stroke-[3]" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight mb-3">
          Foto Berhasil Dicetak!
        </h1>

        {/* Subtitle */}
        <p className="text-[19px] leading-relaxed text-brand-muted max-w-xs mb-8">
          Terima kasih! Jangan lupa ambil fotomu di mulut printer ya.
        </p>

        {/* Readable Auto-Reset Countdown */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-blue-light text-brand-blue font-medium text-base">
          <span>⏱️</span>
          <span>Kembali ke awal dalam {secondsLeft} detik</span>
        </div>
      </main>

      {/* Immediate Done Button */}
      <footer className="w-full p-6 pb-8 bg-white border-t border-brand-border max-w-md mx-auto">
        <button
          onClick={resetToWelcome}
          className="w-full h-[64px] bg-brand-blue hover:bg-brand-blue-hover active:scale-[0.98] text-white font-semibold text-[20px] rounded-2xl flex items-center justify-center gap-3 transition-all duration-150 shadow-sm"
        >
          <span>SELESAI</span>
          <ArrowRight className="w-6 h-6 stroke-[2.2]" />
        </button>
      </footer>
    </div>
  );
};
