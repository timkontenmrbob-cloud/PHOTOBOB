export interface CameraStreamResult {
  stream: MediaStream;
  track: MediaStreamTrack;
}

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Request camera stream responsive to the active device.
 * On mobile/Android: strictly requests front-facing camera (facingMode: 'user').
 * On laptop/desktop: prefers default available webcam without strict overconstraining.
 */
export async function requestCameraStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Kamera tidak didukung oleh browser ini.');
  }

  const isMobile = isMobileDevice();

  // Constraints: High resolution 1:1 preferred
  const constraints: MediaStreamConstraints = {
    audio: false,
    video: isMobile
      ? {
          facingMode: 'user',
          width: { ideal: 1920, min: 720 },
          height: { ideal: 1080, min: 720 },
          aspectRatio: { ideal: 1 },
        }
      : {
          // On desktop, prefer user-facing webcam if flagged, but allow any webcam
          facingMode: { ideal: 'user' },
          width: { ideal: 1920, min: 720 },
          height: { ideal: 1080, min: 720 },
        },
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err: unknown) {
    // If constrained request fails on desktop (e.g. overconstrained facingMode), try basic fallback
    if (!isMobile) {
      try {
        console.warn('Constrained camera request failed on desktop, falling back to basic video constraint...');
        return await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
      } catch (fallbackErr) {
        console.warn('Fallback camera request also failed:', fallbackErr);
      }
    }

    const error = err as { name?: string; message?: string };
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error('Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.');
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error(
        isMobile
          ? 'Kamera depan tidak ditemukan pada ponsel ini.'
          : 'Webcam tidak terdeteksi pada laptop ini. Pastikan webcam aktif.'
      );
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      throw new Error('Kamera sedang digunakan oleh aplikasi lain.');
    }
    throw new Error(error.message || 'Gagal mengakses kamera/webcam.');
  }
}

export function stopCameraStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch (e) {
      console.warn('Error stopping camera track:', e);
    }
  });
}

/**
 * Capture a 1:1 square image from the video element,
 * mirrored horizontally to match the selfie preview.
 * Output size is typically 1080x1080 for crisp composition.
 */
export function captureSquarePhoto(video: HTMLVideoElement, outputDimension = 1080): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      if (!videoWidth || !videoHeight) {
        reject(new Error('Video stream belum siap untuk mengambil foto.'));
        return;
      }

      // Calculate 1:1 center crop
      const minSide = Math.min(videoWidth, videoHeight);
      const startX = (videoWidth - minSide) / 2;
      const startY = (videoHeight - minSide) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = outputDimension;
      canvas.height = outputDimension;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Gagal menginisialisasi canvas context.'));
        return;
      }

      // Mirror horizontally to match selfie preview
      ctx.translate(outputDimension, 0);
      ctx.scale(-1, 1);

      // Draw the cropped center square
      ctx.drawImage(
        video,
        startX,
        startY,
        minSide,
        minSide,
        0,
        0,
        outputDimension,
        outputDimension
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Gagal mengekspor foto dari canvas.'));
          }
        },
        'image/jpeg',
        0.95
      );
    } catch (err) {
      reject(err);
    }
  });
}
