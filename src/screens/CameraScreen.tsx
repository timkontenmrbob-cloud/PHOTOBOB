import React, { useEffect, useRef, useState } from 'react';
import { Camera, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { usePhotobox } from '../context/PhotoboxContext';
import { Header } from '../components/Header';
import {
  requestCameraStream,
  stopCameraStream,
  captureSquarePhoto,
} from '../services/camera';

export const CameraScreen: React.FC = () => {
  const {
    selectedFrame,
    handlePhotoCaptured,
    backToFrameSelection,
  } = usePhotobox();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [squareFrame, setSquareFrame] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Initialize camera stream
  const initCamera = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const stream = await requestCameraStream();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsLoading(false);
    } catch (err: unknown) {
      const error = err as Error;
      setIsLoading(false);
      setErrorMessage(error.message || 'Kamera depan tidak dapat diakses.');
    }
  };

  useEffect(() => {
    initCamera();

    return () => {
      // Clean up camera stream on unmount
      stopCameraStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  // Handle Capture with 3-second countdown
  const handleStartCapture = () => {
    if (countdown !== null || isCapturing) return;

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          triggerPhotoCapture();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerPhotoCapture = async () => {
    if (!videoRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      // Capture 1:1 square photo mirrored to match selfie preview
      const photoBlob = await captureSquarePhoto(videoRef.current, 1080);
      // Stop camera before transitioning
      stopCameraStream(streamRef.current);
      streamRef.current = null;

      await handlePhotoCaptured(photoBlob);
    } catch (err) {
      console.error('Error saat mengambil foto:', err);
      setErrorMessage('Gagal mengambil foto. Silakan coba lagi.');
      setIsCapturing(false);
    }
  };

  const frameOverlayUrl = selectedFrame.customDataUrl || selectedFrame.defaultUrl;

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-dark">
      <Header />

      <main className="flex-1 px-4 sm:px-6 max-w-md mx-auto w-full py-4 flex flex-col items-center justify-between">
        {/* Title & Instruction */}
        <div className="text-center mb-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight mb-1">
            Siap-Siap Foto!
          </h1>
          <p className="text-[17px] text-brand-muted">
            Lihat kamera, lalu tekan tombol di bawah.
          </p>
        </div>

        {/* Portrait frame around the square selfie */}
        <div className="w-full aspect-[3/4] max-w-[370px] rounded-2xl overflow-hidden relative bg-white shadow-inner border-2 border-brand-border flex items-center justify-center">
          {/* Camera Video (mirrored for natural selfie view) */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute left-0 top-[6.25%] w-full aspect-square object-cover -scale-x-100"
          />

          {/* Real-time Selected Frame Overlay */}
          <img
            src={frameOverlayUrl}
            alt="Frame Overlay"
            onLoad={(e) => setSquareFrame(Math.abs(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight - 1) < 0.01)}
            className={`absolute left-0 w-full object-contain pointer-events-none z-10 ${squareFrame ? 'top-[6.25%] aspect-square' : 'inset-y-0 h-full'}`}
          />

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-10 h-10 text-brand-blue animate-spin" />
              <p className="text-base font-semibold text-brand-dark">Menyiapkan kamera...</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="absolute inset-0 bg-white z-30 p-6 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-12 h-12 text-brand-red mb-3" />
              <h3 className="text-lg font-bold text-brand-dark mb-1">Kamera Bermasalah</h3>
              <p className="text-sm text-brand-muted mb-4">{errorMessage}</p>
              <button
                onClick={initCamera}
                className="px-5 py-2.5 bg-brand-blue text-white rounded-xl font-medium text-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
            </div>
          )}

          {/* Centered Large 3-2-1 Countdown Animation */}
          {countdown !== null && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-20 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-white/95 text-brand-blue flex items-center justify-center text-6xl font-black shadow-2xl animate-ping-once">
                {countdown}
              </div>
            </div>
          )}

          {/* Flash Effect on Capture */}
          {isCapturing && (
            <div className="absolute inset-0 bg-white z-40 animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Small hint */}
        <p className="text-sm text-brand-muted mt-2 text-center">
          Frame: <span className="font-semibold text-brand-dark">{selectedFrame.name}</span>
        </p>
      </main>

      {/* Bottom Sticky Action Area */}
      <footer className="w-full p-6 pb-8 bg-white border-t border-brand-border max-w-md mx-auto flex flex-col gap-3">
        <button
          onClick={handleStartCapture}
          disabled={isLoading || countdown !== null || isCapturing || !!errorMessage}
          className="w-full h-[64px] bg-brand-blue hover:bg-brand-blue-hover active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-[20px] rounded-2xl flex items-center justify-center gap-3 transition-all duration-150 shadow-sm"
        >
          <Camera className="w-6 h-6 stroke-[2.2]" />
          <span>{countdown !== null ? `MENGAMBIL... (${countdown})` : 'AMBIL FOTO'}</span>
        </button>

        <button
          onClick={() => {
            stopCameraStream(streamRef.current);
            backToFrameSelection();
          }}
          disabled={countdown !== null || isCapturing}
          className="w-full h-[50px] bg-white hover:bg-gray-50 active:bg-gray-100 text-brand-muted font-semibold text-[17px] rounded-xl flex items-center justify-center gap-2 transition-colors border border-transparent"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Ganti Bingkai</span>
        </button>
      </footer>
    </div>
  );
};
