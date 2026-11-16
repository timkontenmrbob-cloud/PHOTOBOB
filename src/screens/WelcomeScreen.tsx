import React, { useEffect, useRef, useState } from 'react';
import { Camera, ArrowRight, RefreshCw } from 'lucide-react';
import { usePhotobox } from '../context/PhotoboxContext';
import { Header } from '../components/Header';
import { requestCameraStream, stopCameraStream } from '../services/camera';

export const WelcomeScreen: React.FC = () => {
  const { startVisitorSession, isAdminOpen } = usePhotobox();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStatus, setCameraStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [cameraError, setCameraError] = useState('');
  const [cameraAttempt, setCameraAttempt] = useState(0);

  useEffect(() => {
    if (isAdminOpen) return;
    let cancelled = false;
    let activeStream: MediaStream | null = null;
    const video = videoRef.current;
    setCameraStatus('loading');

    const startPreview = async () => {
      try {
        const stream = await requestCameraStream();
        // Permission can resolve after leaving this screen or opening Admin.
        if (cancelled || !video) {
          stopCameraStream(stream);
          return;
        }
        activeStream = stream;
        video.srcObject = stream;
        await video.play();
        if (!cancelled) setCameraStatus('ready');
      } catch (error) {
        stopCameraStream(activeStream);
        activeStream = null;
        if (!cancelled) {
          setCameraError(error instanceof Error ? error.message : 'Kamera belum bisa dibuka.');
          setCameraStatus('error');
        }
      }
    };

    void startPreview();
    return () => {
      cancelled = true;
      stopCameraStream(activeStream);
      if (video) video.srcObject = null;
    };
  }, [cameraAttempt, isAdminOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-dark">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full text-center py-5">
        {/* Live selfie preview attracts visitors before they choose a frame. */}
        <div className="w-full aspect-square max-w-[350px] rounded-3xl overflow-hidden relative bg-brand-blue-light border border-blue-100 mb-6">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            aria-label="Preview kamera selfie"
            className="w-full h-full object-cover -scale-x-100"
          />
          {cameraStatus === 'ready' && (
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-dark">
              <Camera className="w-4 h-4 text-brand-blue" />
              <span>Siapkan Pose Terbaikmu!</span>
            </div>
          )}
          {cameraStatus === 'loading' && (
            <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-blue-light text-brand-blue">
              <RefreshCw className="w-9 h-9 animate-spin" />
              <p className="text-base font-semibold">Menyiapkan kamera...</p>
            </div>
          )}
          {cameraStatus === 'error' && (
            <div role="status" className="absolute inset-0 flex flex-col items-center justify-center px-5 bg-brand-blue-light">
              <Camera className="w-12 h-12 text-brand-blue mb-3" />
              <p className="font-bold text-brand-dark mb-2">Yuk, Aktifkan Kameramu!</p>
              <p className="text-sm text-brand-muted mb-4">{cameraError}</p>
              <button
                onClick={() => setCameraAttempt(attempt => attempt + 1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white font-semibold text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight mb-3">
          Foto & Abadikan Momentmu!
        </h1>

        {/* Subtitle */}
        <p className="text-[19px] leading-relaxed text-brand-muted max-w-xs mb-5">
          Pilih bingkai, foto, cetak, & share kenanganmu.
        </p>

        {/* Instruction Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue-light text-brand-blue font-medium text-base">
          <span>✨</span>
          <span>Free 1 Lembar Foto Cetak</span>
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
