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
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Gagal memuat gambar: ' + e));
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

  // Put back to RGBA (slightly warm black/white thermal paper look)
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    const v = gray[i] === 0 ? 25 : 250; // dark ink vs receipt paper
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
 * [ HEADER ]
 * [ SQUARE PHOTO + FRAME (1:1) ]
 * [ FOOTER ]
 */
export async function composePhotoboxLayout(options: ComposeOptions): Promise<ComposeResult> {
  const { photoBlob, frameUrl, settings, sessionRef, dateTimeStr } = options;

  const photoUrl = URL.createObjectURL(photoBlob);
  const [photoImg, frameImg] = await Promise.all([
    loadImage(photoUrl),
    loadImage(frameUrl),
  ]);

  // Clean up temporary photo object URL
  URL.revokeObjectURL(photoUrl);

  // Print dimensions based on settings
  const printWidth = settings.rasterDotWidth || 576;
  const marginX = settings.marginHorizontal || 12;
  const photoSize = printWidth - marginX * 2; // Square 1:1
  const headerHeight = settings.headerHeight || 75;
  const footerHeight = settings.footerHeight || 75;
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

  // 2. Render HEADER (Compact with zero excess top margin)
  ctx.fillStyle = '#141E30';
  ctx.textAlign = 'center';

  // Header Title
  const headerText = settings.headerText || settings.appTitle || 'PHOTOBOX';
  ctx.font = 'bold 26px "Inter", "Segoe UI", Arial, sans-serif';
  ctx.fillText(headerText, printWidth / 2, headerHeight * 0.40);

  // Header Subtitle / Decorative Divider
  ctx.font = '500 14px "Inter", "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('★  SELF-SERVICE PHOTOBOX  ★', printWidth / 2, headerHeight * 0.72);

  // Thin header rule
  ctx.strokeStyle = '#141E30';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginX, headerHeight - 6);
  ctx.lineTo(printWidth - marginX, headerHeight - 6);
  ctx.stroke();

  // 3. Render SQUARE PHOTO (1:1)
  const photoY = headerHeight;
  ctx.drawImage(photoImg, marginX, photoY, photoSize, photoSize);

  // 4. Render FRAME OVERLAY (1:1)
  ctx.drawImage(frameImg, marginX, photoY, photoSize, photoSize);

  // 5. Render FOOTER (Compact)
  const footerY = headerHeight + photoSize;

  // Thin footer rule
  ctx.strokeStyle = '#141E30';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginX, footerY + 8);
  ctx.lineTo(printWidth - marginX, footerY + 8);
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

  // 6. Apply Brightness & Contrast Optimization for thermal print
  if (settings.brightness !== 1.0 || settings.contrast !== 1.0) {
    applyBrightnessContrast(
      ctx,
      printWidth,
      totalHeight,
      settings.brightness,
      settings.contrast
    );
  }

  // Create standard preview data URL
  const previewDataUrl = canvas.toDataURL('image/png');

  // Create simulated thermal dithered preview for visitor
  const thermalPreviewUrl = createThermalDitherSimulation(canvas);

  // Export raw base64 PNG without data URL prefix for Cleanter
  const cleanterBase64 = previewDataUrl.replace(/^data:image\/png;base64,/, '');

  return {
    previewUrl: previewDataUrl,
    thermalPreviewUrl,
    cleanterBase64,
    width: printWidth,
    height: totalHeight,
  };
}
