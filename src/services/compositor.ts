import { AdminSettings } from '../types';
import { getFramePhotoArea } from './frameLayout';

export interface ComposeOptions {
  photoBlob: Blob;
  frameUrl: string;
  frameId?: string;
  settings: AdminSettings;
  sessionRef: string;
  dateTimeStr?: string;
  digital?: boolean;
}

export interface ComposeResult {
  previewUrl: string; // Object URL for on-screen preview
  thermalPreviewUrl: string; // Grayscale PNG for preview and printer input
  cleanterBase64: string; // Raw base64 PNG without data URL prefix for Cleanter
  width: number;
  height: number;
  colorBlob?: Blob;
  bwBlob?: Blob;
}

/**
 * Loads an image from a URL or Blob
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Do NOT set crossOrigin on blob:, data:, or relative URLs as this triggers CORS errors in Chrome
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.error('[Compositor] Gagal memuat gambar dari:', src.slice(0, 60), e);
      reject(new Error('Gagal memuat gambar: ' + e));
    };
    img.src = src;
  });
}

/**
 * Formats current date and time in Indonesian locale
 */
export function formatIndonesianDate(date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('id-ID', options).replace(/\./g, ':');
}

/** Convert the preview to plain grayscale without changing its tonal range. */
function applyGrayscale(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = Math.round(
      image.data[i] * 0.2126 + image.data[i + 1] * 0.7152 + image.data[i + 2] * 0.0722
    );
    image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
  }
  ctx.putImageData(image, 0, 0);
}

/**
 * Composes the vertical receipt layout:
 * [ HEADER ] (optional, omitted by default to save paper)
 * [ PORTRAIT FRAME (3:4), SQUARE PHOTO (1:1) ]
 * [ FOOTER ] (optional, omitted by default to save paper)
 */
export async function composePhotoboxLayout(options: ComposeOptions): Promise<ComposeResult> {
  const { photoBlob, frameUrl, settings, sessionRef, dateTimeStr } = options;

  const photoUrl = URL.createObjectURL(photoBlob);
  let photoImg: HTMLImageElement;
  let frameImg: HTMLImageElement | null = null;

  try {
    photoImg = await loadImage(photoUrl);
  } finally {
    URL.revokeObjectURL(photoUrl);
  }

  if (frameUrl) {
    try {
      frameImg = await loadImage(frameUrl);
    } catch (frameErr) {
      console.warn('[Compositor] Gagal memuat frame overlay, melanjutkan dengan foto saja:', frameErr);
    }
  }

  // Print dimensions based on settings
  // Protect against overly wide values (> 576 dots for 80mm thermal roll causes line wrapping/split parts)
  const rawWidth = settings.rasterDotWidth || 576;
  const maxWidth = settings.printerMode === 'android-bluetooth' && settings.paperWidth === 58 ? 384 : 576;
  const printWidth = options.digital ? 1080 : Math.min(maxWidth, Math.max(384, Math.floor(rawWidth / 8) * 8));
  const layoutScale = options.digital ? 1080 / 576 : 1;

  // User requirement: HAPUS FOOTER DAN HEADER BIAR OTOMATIS HEMAT KERTAS
  const showHeader = settings.showHeader === true;
  const showFooter = settings.showFooter === true;

  const headerHeight = showHeader ? (settings.headerHeight || 40) * layoutScale : 0;
  const footerHeight = showFooter ? (settings.footerHeight || 70) * layoutScale : 0;

  // Digital files keep the exact design coordinates; print margins apply only to paper.
  const area = getFramePhotoArea(options.frameId);
  const marginX = options.digital ? 0 : Math.min(Math.floor(printWidth / 4), Math.max(0, (settings.marginHorizontal ?? 16) * layoutScale));
  const frameWidth = printWidth - marginX * 2;
  const frameHeight = Math.round(frameWidth * 4 / 3);
  const layoutHeight = Math.round(printWidth * 4 / 3);
  const frameY = headerHeight + Math.round((layoutHeight - frameHeight) / 2);
  const photoSize = frameWidth * area.size / 1080;
  const photoX = marginX + frameWidth * area.x / 1080;
  const photoY = frameY + frameHeight * area.y / 1440;
  const totalHeight = headerHeight + layoutHeight + footerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = printWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Gagal menginisialisasi canvas untuk pembuatan layout cetak.');
  }

  // 1. Fill background with clean white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, printWidth, totalHeight);

  // 2. Render HEADER (Only if showHeader is true and headerHeight > 0)
  if (showHeader && headerHeight > 0) {
    ctx.fillStyle = '#141E30';
    ctx.textAlign = 'center';

    const headerText = settings.headerText || settings.appTitle || 'PHOTOBOX';

    if (headerHeight < 55) {
      // ULTRA COMPACT SINGLE-LINE TITLE (Saves ~1.5 - 2 cm of paper)
      ctx.font = 'bold 22px "Inter", "Segoe UI", Arial, sans-serif';
      ctx.fillText(headerText, printWidth / 2, headerHeight * 0.70);
    } else {
      // STANDARD FULL HEADER (Title + Subtitle + Thin rule)
      ctx.font = 'bold 26px "Inter", "Segoe UI", Arial, sans-serif';
      ctx.fillText(headerText, printWidth / 2, headerHeight * 0.40);

      ctx.font = '500 14px "Inter", "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('★  SELF-SERVICE PHOTOBOX  ★', printWidth / 2, headerHeight * 0.72);

      // Thin header rule centered with the photo
      ctx.strokeStyle = '#141E30';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(photoX, headerHeight - 6);
      ctx.lineTo(photoX + photoSize, headerHeight - 6);
      ctx.stroke();
    }
  }

  // 3. Render SQUARE PHOTO (1:1) - Strictly center-cropped so it never stretches or widens
  // Reserve a small top band and a larger bottom band for frame artwork.
  const pW = photoImg.naturalWidth || photoImg.width;
  const pH = photoImg.naturalHeight || photoImg.height;
  const pMin = Math.min(pW, pH);
  const pX = Math.round((pW - pMin) / 2);
  const pY = Math.round((pH - pMin) / 2);
  ctx.drawImage(photoImg, pX, pY, pMin, pMin, photoX, photoY, photoSize, photoSize);

  // 4. Fit the frame without stretching. Existing square frames still align with the photo.
  if (frameImg) {
    const fW = frameImg.naturalWidth || frameImg.width;
    const fH = frameImg.naturalHeight || frameImg.height;
    const isSquare = Math.abs(fW / fH - 1) < 0.01;
    const scale = Math.min(frameWidth / fW, frameHeight / fH);
    const drawWidth = isSquare ? photoSize : fW * scale;
    const drawHeight = isSquare ? photoSize : fH * scale;
    const drawX = marginX + (frameWidth - drawWidth) / 2;
    const drawY = isSquare ? photoY : frameY + (frameHeight - drawHeight) / 2;
    ctx.drawImage(frameImg, 0, 0, fW, fH, drawX, drawY, drawWidth, drawHeight);
  }

  // 5. Render FOOTER (Only if showFooter is true and footerHeight > 0)
  if (showFooter && footerHeight > 0) {
    const footerY = headerHeight + layoutHeight;

    // Thin footer rule centered with the photo
    ctx.strokeStyle = '#141E30';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(photoX, footerY + 8);
    ctx.lineTo(photoX + photoSize, footerY + 8);
    ctx.stroke();

    // Footer Main Text
    ctx.fillStyle = '#141E30';
    ctx.font = 'bold 20px "Inter", "Segoe UI", Arial, sans-serif';
    ctx.fillText(settings.footerText || 'Capture Your Moment', printWidth / 2, footerY + 36);

    // Date and Session Ref
    const dateText = dateTimeStr || formatIndonesianDate();
    let subFooter = '';
    if (settings.showDate && settings.showSessionCode) {
      subFooter = `${dateText}  •  #${sessionRef.slice(-6)}`;
    } else if (settings.showDate) {
      subFooter = dateText;
    } else if (settings.showSessionCode) {
      subFooter = `SESI: #${sessionRef.slice(-6)}`;
    }

    if (subFooter) {
      ctx.font = '500 13px "Inter", "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(subFooter, printWidth / 2, footerY + 58);
    }
  }

  // Digital exports retain camera colors and skip thermal brightness/dithering.
  if (options.digital) {
    const jpeg = () => new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Gagal menyiapkan foto download.')), 'image/jpeg', 0.88);
    });
    const colorBlob = await jpeg();
    applyGrayscale(ctx, printWidth, totalHeight);
    const bwBlob = await jpeg();
    return { previewUrl: '', thermalPreviewUrl: '', cleanterBase64: '', width: printWidth, height: totalHeight, colorBlob, bwBlob };
  }

  // Preserve natural tones: grayscale only, with no cosmetic processing.
  applyGrayscale(ctx, printWidth, totalHeight);
  const thermalPreviewUrl = canvas.toDataURL('image/png');
  const cleanterBase64 = thermalPreviewUrl.replace(/^data:image\/png;base64,/, '');

  return {
    previewUrl: thermalPreviewUrl, // Plain grayscale; hardware conversion happens in the printer adapter.
    thermalPreviewUrl,
    cleanterBase64,
    width: printWidth,
    height: totalHeight,
  };
}
