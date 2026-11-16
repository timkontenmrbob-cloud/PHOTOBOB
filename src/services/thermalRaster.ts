/** Fine error diffusion, rather than repeating tiles, for a monochrome printhead. */
export function diffuseThermalGrayscale(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  gamma = 1.2,
): Uint8ClampedArray {
  const tones = new Float32Array(width * height);
  for (let i = 0; i < tones.length; i++) {
    const offset = i * 4;
    const alpha = rgba[offset + 3] / 255;
    const gray = (rgba[offset] * 0.2126 + rgba[offset + 1] * 0.7152 + rgba[offset + 2] * 0.0722) * alpha + 255 * (1 - alpha);
    // Lift midtones gently for thermal dot gain; preserve solid text and blank paper.
    tones[i] = 255 * Math.pow(gray / 255, 1 / gamma);
  }
  const output = new Uint8ClampedArray(rgba.length);
  for (let y = 0; y < height; y++) {
    const direction = y % 2 ? -1 : 1;
    for (let x = direction === 1 ? 0 : width - 1; x >= 0 && x < width; x += direction) {
      const i = y * width + x;
      const value = tones[i] < 127.5 ? 0 : 255;
      output[i * 4] = output[i * 4 + 1] = output[i * 4 + 2] = value;
      output[i * 4 + 3] = 255;
      const error = tones[i] - value;
      const nextX = x + direction;
      if (nextX >= 0 && nextX < width) tones[i + direction] += error * 7 / 16;
      if (y + 1 < height) {
        const previousX = x - direction;
        if (previousX >= 0 && previousX < width) tones[i + width - direction] += error * 3 / 16;
        tones[i + width] += error * 5 / 16;
        if (nextX >= 0 && nextX < width) tones[i + width + direction] += error / 16;
      }
    }
  }
  return output;
}

/** Prepare only the USB print image. Screen previews and downloads stay natural grayscale. */
export function createBrowserThermalImage(image: HTMLImageElement, printableWidthMm: number): string {
  const canvas = document.createElement('canvas');
  // Existing iWare setup uses 8 dots/mm (576 dots over a 72 mm print area).
  canvas.width = Math.min(576, Math.max(256, Math.round(printableWidthMm * 8 / 8) * 8));
  canvas.height = Math.round(canvas.width * image.naturalHeight / image.naturalWidth);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Gagal menyiapkan gambar cetak.');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  pixels.data.set(diffuseThermalGrayscale(pixels.data, canvas.width, canvas.height));
  ctx.putImageData(pixels, 0, 0);
  return canvas.toDataURL('image/png');
}
