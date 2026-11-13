import { AdminSettings } from '../types';

export interface ComposeOptions {
  photoBlob: Blob;
  frameUrl: string;
  settings: AdminSettings;
  sessionRef: string;
  dateTimeStr?: string;
}

export interface ComposeResult {
  previewUrl: string; // Object URL for on-screen preview
  thermalPreviewUrl: string; // Object URL showing simulated thermal dithering
  cleanterBase64: string; // Raw base64 PNG without data URL prefix for Cleanter
  width: number;
  height: number;
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

/**
 * Adjusts brightness and contrast of imageData
 */
function applyBrightnessContrast(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  brightness: number,
  contrast: number
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // contrast multiplier: c > 1 increases contrast
  const c = contrast;
  const b = (brightness - 1.0) * 255;

  for (let i = 0; i < data.length; i += 4) {
    // Keep blank paper white when lowering contrast, avoiding ink in the margins.
    if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) continue;
    // Red
    let r = (data[i] - 128) * c + 128 + b;
    // Green
    let g = (data[i + 1] - 128) * c + 128 + b;
    // Blue
    let bCol = (data[i + 2] - 128) * c + 128 + b;

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, bCol));
  }

  ctx.putImageData(imgData, 0, 0);
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
 * Performs client-side Floyd-Steinberg dithering for simulated thermal preview
 */
function createThermalDitherSimulation(sourceCanvas: HTMLCanvasElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return sourceCanvas.toDataURL('image/png');

  ctx.drawImage(sourceCanvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  const w = canvas.width;
  const h = canvas.height;

  // Convert to grayscale luminance array
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    // Rec. 709 luminance
    gray[i] = d[idx] * 0.2126 + d[idx + 1] * 0.7152 + d[idx + 2] * 0.0722;
  }

  // Floyd-Steinberg error diffusion
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const oldVal = gray[idx];
      const newVal = oldVal < 128 ? 0 : 255;
      gray[idx] = newVal;
      const err = oldVal - newVal;

      if (x + 1 < w) gray[idx + 1] += (err * 7) / 16;
      if (x - 1 >= 0 && y + 1 < h) gray[idx + w - 1] += (err * 3) / 16;
      if (y + 1 < h) gray[idx + w] += (err * 5) / 16;
      if (x + 1 < w && y + 1 < h) gray[idx + w + 1] += (err * 1) / 16;
    }
  }

  // Put back to RGBA: pure 0 for black ink dot, pure 255 for white receipt paper
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    const v = gray[i] === 0 ? 0 : 255;
    d[idx] = v;
    d[idx + 1] = v;
    d[idx + 2] = v;
    d[idx + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Composes the vertical receipt layout:
 * [ HEADER ] (optional, omitted by default to save paper)
 * [ SQUARE PHOTO + FRAME (1:1) ]
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
  const printWidth = Math.min(576, Math.max(384, Math.floor(rawWidth / 8) * 8));

  // User requirement: HAPUS FOOTER DAN HEADER BIAR OTOMATIS HEMAT KERTAS
  const showHeader = settings.showHeader === true;
  const showFooter = settings.showFooter === true;

  const headerHeight = showHeader ? (settings.headerHeight || 40) : 0;
  const footerHeight = showFooter ? (settings.footerHeight || 70) : 0;

  // Margin horizontal: default 16 dots (~2mm) so photo fits centered without wasting paper
  const marginX = settings.marginHorizontal !== undefined ? settings.marginHorizontal : 16;
  const photoSize = printWidth - marginX * 2; // Square 1:1
  const photoX = Math.round((printWidth - photoSize) / 2); // Perfectly centered horizontally

  // Total canvas height:
  // When showHeader=false and showFooter=false, totalHeight = photoSize (PURE SQUARE PHOTO, ZERO PAPER WASTE!)
  const totalHeight = headerHeight + photoSize + footerHeight;

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
  // Starts at Y = headerHeight (Y = 0 when header is removed!)
  const photoY = headerHeight;
  const pW = photoImg.naturalWidth || photoImg.width;
  const pH = photoImg.naturalHeight || photoImg.height;
  const pMin = Math.min(pW, pH);
  const pX = Math.round((pW - pMin) / 2);
  const pY = Math.round((pH - pMin) / 2);
  ctx.drawImage(photoImg, pX, pY, pMin, pMin, photoX, photoY, photoSize, photoSize);

  // 4. Render FRAME OVERLAY (1:1) - Aligned exactly over the centered photo
  if (frameImg) {
    const fW = frameImg.naturalWidth || frameImg.width;
    const fH = frameImg.naturalHeight || frameImg.height;
    ctx.drawImage(frameImg, 0, 0, fW, fH, photoX, photoY, photoSize, photoSize);
  }

  // 5. Render FOOTER (Only if showFooter is true and footerHeight > 0)
  if (showFooter && footerHeight > 0) {
    const footerY = headerHeight + photoSize;

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

  // Preview and print share the same grayscale and tonal adjustments.
  applyGrayscale(ctx, printWidth, totalHeight);

  // 6. Apply calibration before exporting either preview or print.
  if (settings.brightness !== 1.0 || settings.contrast !== 1.0) {
    applyBrightnessContrast(
      ctx,
      printWidth,
      totalHeight,
      settings.brightness,
      settings.contrast
    );
  }

  // Keep the on-screen B&W smooth while matching the calibrated print tones.
  const previewDataUrl = canvas.toDataURL('image/png');

  // The thermal printer requires one-bit output to represent those tones as dots.
  const thermalPreviewUrl = createThermalDitherSimulation(canvas);

  // Export raw base64 PNG from the dithered image for Cleanter & QZ Tray
  const cleanterBase64 = thermalPreviewUrl.replace(/^data:image\/png;base64,/, '');

  return {
    previewUrl: previewDataUrl,
    thermalPreviewUrl,
    cleanterBase64,
    width: printWidth,
    height: totalHeight,
  };
}
