import { AdminSettings, PrintCalibration } from '../types';

export const NEUTRAL_CALIBRATION: PrintCalibration = {
  brightness: 1, contrast: 1, gamma: 1, method: 'grayscale', threshold: 128,
};

export function calibratePixels(source: Uint8ClampedArray, width: number, height: number, options: PrintCalibration): Uint8ClampedArray {
  if (options.method === 'original') return source.slice();
  const tone = new Float32Array(width * height);
  const result = new Uint8ClampedArray(source.length);
  const brightness = Math.min(1.6, Math.max(0.6, options.brightness));
  const contrast = Math.min(1.6, Math.max(0.5, options.contrast));
  const gamma = Math.min(2, Math.max(0.5, options.gamma));
  for (let i = 0; i < tone.length; i++) {
    const offset = i * 4;
    const alpha = source[offset + 3] / 255;
    const gray = (source[offset] * 0.2126 + source[offset + 1] * 0.7152 + source[offset + 2] * 0.0722) * alpha + 255 * (1 - alpha);
    // Preserve pure white margins so reduced contrast does not ink blank paper.
    const adjusted = gray >= 254.99 ? 255 : Math.min(255, Math.max(0, (gray - 128) * contrast + 128 + (brightness - 1) * 255));
    tone[i] = 255 * Math.pow(adjusted / 255, 1 / gamma);
  }
  for (let y = 0; y < height; y++) {
    const direction = y % 2 ? -1 : 1;
    for (let x = direction === 1 ? 0 : width - 1; x >= 0 && x < width; x += direction) {
      const i = y * width + x;
      const value = options.method === 'grayscale' ? Math.round(tone[i]) : tone[i] < options.threshold ? 0 : 255;
      result[i * 4] = result[i * 4 + 1] = result[i * 4 + 2] = value;
      result[i * 4 + 3] = 255;
      if (options.method !== 'diffusion') continue;
      const error = tone[i] - value;
      const next = x + direction;
      if (next >= 0 && next < width) tone[i + direction] += error * 7 / 16;
      if (y + 1 < height) {
        const previous = x - direction;
        if (previous >= 0 && previous < width) tone[i + width - direction] += error * 3 / 16;
        tone[i + width] += error * 5 / 16;
        if (next >= 0 && next < width) tone[i + width + direction] += error / 16;
      }
    }
  }
  return result;
}

export function applyPrintCalibration(source: HTMLCanvasElement, settings: AdminSettings): HTMLCanvasElement {
  if (settings.printOriginalPhoto !== false || settings.printCalibration?.method === 'original') return source;
  const raw = settings.printerMode === 'windows-qz' && settings.qzUseRawEscpos;
  const options = settings.printCalibration || { ...NEUTRAL_CALIBRATION, method: raw ? 'diffusion' : 'grayscale' };
  const canvas = document.createElement('canvas');
  canvas.width = raw ? Math.min(576, Math.max(384, Math.floor((settings.rasterDotWidth || 576) / 8) * 8)) : source.width;
  canvas.height = Math.round(canvas.width * source.height / source.width);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Gagal menyiapkan preview kalibrasi.');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  pixels.data.set(calibratePixels(pixels.data, canvas.width, canvas.height, {
    ...options, method: raw && options.method === 'grayscale' ? 'diffusion' : options.method,
  }));
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

/** GS v 0 bytes, packed locally to avoid QZ's failing raw IMAGE converter. */
export function encodeEscPosRaster(pixels: Uint8ClampedArray, width: number, height: number, feedLines = 2, cut = false): Uint8Array {
  if (width < 1 || width > 576 || width % 8 || height < 1 || pixels.length !== width * height * 4) throw new Error('Ukuran raster ESC/POS tidak valid.');
  const bytesPerRow = width / 8;
  const output: number[] = [27, 64, 27, 97, 1];
  for (let row = 0; row < height; row += 256) {
    const rows = Math.min(256, height - row);
    output.push(29, 118, 48, 0, bytesPerRow & 255, bytesPerRow >> 8, rows & 255, rows >> 8);
    for (let y = row; y < row + rows; y++) {
      for (let x = 0; x < width; x += 8) {
        let packed = 0;
        for (let bit = 0; bit < 8; bit++) {
          const offset = (y * width + x + bit) * 4;
          if (pixels[offset + 3] >= 128 && pixels[offset] < 128) packed |= 128 >> bit;
        }
        output.push(packed);
      }
    }
  }
  output.push(27, 100, Math.min(5, Math.max(0, Math.round(feedLines))));
  if (cut) output.push(29, 86, 66, 0);
  return Uint8Array.from(output);
}

export async function pngToEscPos(base64: string, settings: AdminSettings): Promise<string> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Gambar ESC/POS tidak bisa dibaca.'));
    image.src = `data:image/png;base64,${base64}`;
  });
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(576, Math.max(384, Math.floor((settings.rasterDotWidth || 576) / 8) * 8));
  canvas.height = Math.round(canvas.width * image.naturalHeight / image.naturalWidth);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Gagal membuat perintah ESC/POS.');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  // Inputs from compositor are already calibrated. Only quantize here; never
  // apply brightness, contrast, or gamma a second time.
  const binary = calibratePixels(data, canvas.width, canvas.height, {
    ...NEUTRAL_CALIBRATION, method: settings.printCalibration?.method === 'threshold' ? 'threshold' : 'diffusion',
  });
  const bytes = encodeEscPosRaster(binary, canvas.width, canvas.height, settings.feedLines, settings.qzFeedAndCut);
  let binaryString = '';
  for (const byte of bytes) binaryString += String.fromCharCode(byte);
  return btoa(binaryString);
}
