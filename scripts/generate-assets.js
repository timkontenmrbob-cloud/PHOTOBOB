import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public');
const iconsDir = path.resolve(publicDir, 'icons');
const framesDir = path.resolve(publicDir, 'frames');

[iconsDir, framesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 1. Generate Favicon SVG & PNGs
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#1769E0"/>
  <!-- Camera Body -->
  <path d="M120 180 C120 160, 136 144, 156 144 L180 144 L196 116 C204 104, 218 96, 232 96 L280 96 C294 96, 308 104, 316 116 L332 144 L356 144 C376 144, 392 160, 392 180 L392 340 C392 360, 376 376, 356 376 L156 376 C136 376, 120 360, 120 340 Z" fill="#FFFFFF"/>
  <!-- Camera Lens Outer -->
  <circle cx="256" cy="260" r="76" fill="#1769E0"/>
  <!-- Camera Lens Inner -->
  <circle cx="256" cy="260" r="48" fill="#FFFFFF"/>
  <circle cx="272" cy="244" r="14" fill="#1769E0"/>
  <!-- Flash Dot -->
  <circle cx="348" cy="184" r="14" fill="#1769E0"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

async function generateAssets() {
  console.log('Generating PWA icons...');
  await sharp(Buffer.from(faviconSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192x192.png'));

  await sharp(Buffer.from(faviconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512x512.png'));

  // Portrait polaroid with a square transparent aperture and a larger caption band.
  const polaroidSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440">
    <path d="M0 0H1080V1440H0Z M60 90V1050H1020V90Z" fill="#fff" fill-rule="evenodd"/>
  </svg>`;
  await sharp(Buffer.from(polaroidSvg)).png().toFile(path.join(framesDir, 'polaroid.png'));

  console.log('Generating Default 1080x1080 Transparent Frames...');

  // Frame 1: Classic — Clean, minimal elegant border
  const frame1Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
    <rect x="36" y="36" width="1008" height="1008" fill="none" stroke="#141E30" stroke-width="14" rx="16"/>
    <rect x="56" y="56" width="968" height="968" fill="none" stroke="#141E30" stroke-width="4" stroke-dasharray="16 10" rx="10"/>
    <!-- Subtle corner accents -->
    <path d="M24 80 L80 24 M1000 24 L1056 80 M24 1000 L80 1056 M1000 1056 L1056 1000" stroke="#141E30" stroke-width="8"/>
    <!-- Bottom center badge -->
    <rect x="440" y="1022" width="200" height="36" rx="18" fill="#141E30"/>
    <text x="540" y="1046" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" letter-spacing="4">CLASSIC</text>
  </svg>`;

  // Frame 2: Retro — Vintage-inspired border, film sprocket aesthetic
  const frame2Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
    <!-- Outer thick vintage border -->
    <rect x="40" y="40" width="1000" height="1000" fill="none" stroke="#141E30" stroke-width="24" rx="36"/>
    <rect x="76" y="76" width="928" height="928" fill="none" stroke="#141E30" stroke-width="6" rx="20"/>
    <!-- Retro Corner Ornaments -->
    <circle cx="100" cy="100" r="16" fill="#141E30"/>
    <circle cx="980" cy="100" r="16" fill="#141E30"/>
    <circle cx="100" cy="980" r="16" fill="#141E30"/>
    <circle cx="980" cy="980" r="16" fill="#141E30"/>
    <!-- Vintage Film notch dashes on sides -->
    <line x1="40" y1="360" x2="64" y2="360" stroke="#141E30" stroke-width="8"/>
    <line x1="40" y1="540" x2="64" y2="540" stroke="#141E30" stroke-width="8"/>
    <line x1="40" y1="720" x2="64" y2="720" stroke="#141E30" stroke-width="8"/>
    <line x1="1016" y1="360" x2="1040" y2="360" stroke="#141E30" stroke-width="8"/>
    <line x1="1016" y1="540" x2="1040" y2="540" stroke="#141E30" stroke-width="8"/>
    <line x1="1016" y1="720" x2="1040" y2="720" stroke="#141E30" stroke-width="8"/>
    <!-- Bottom Badge -->
    <rect x="430" y="1014" width="220" height="42" rx="8" fill="#141E30"/>
    <text x="540" y="1042" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="6">RETRO</text>
  </svg>`;

  // Frame 3: Fun — Playful geometric elements, stars, dots
  const frame3Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
    <!-- Playful scalloped/wavy effect border -->
    <rect x="44" y="44" width="992" height="992" fill="none" stroke="#141E30" stroke-width="16" rx="40"/>
    <!-- Corner Stars -->
    <g fill="#141E30">
      <!-- Top Left Star -->
      <polygon points="90,65 96,82 114,82 99,93 105,110 90,100 75,110 81,93 66,82 84,82" transform="scale(1.2) translate(-10,-10)"/>
      <!-- Top Right Star -->
      <polygon points="90,65 96,82 114,82 99,93 105,110 90,100 75,110 81,93 66,82 84,82" transform="translate(870,0) scale(1.2) translate(-10,-10)"/>
      <!-- Bottom Left Star -->
      <polygon points="90,65 96,82 114,82 99,93 105,110 90,100 75,110 81,93 66,82 84,82" transform="translate(0,870) scale(1.2) translate(-10,-10)"/>
      <!-- Bottom Right Star -->
      <polygon points="90,65 96,82 114,82 99,93 105,110 90,100 75,110 81,93 66,82 84,82" transform="translate(870,870) scale(1.2) translate(-10,-10)"/>
    </g>
    <!-- Playful Polka Dots along the border -->
    <g fill="#141E30">
      <circle cx="240" cy="44" r="8"/>
      <circle cx="380" cy="44" r="8"/>
      <circle cx="540" cy="44" r="10"/>
      <circle cx="700" cy="44" r="8"/>
      <circle cx="840" cy="44" r="8"/>
      
      <circle cx="240" cy="1036" r="8"/>
      <circle cx="380" cy="1036" r="8"/>
      <circle cx="700" cy="1036" r="8"/>
      <circle cx="840" cy="1036" r="8"/>

      <circle cx="44" cy="260" r="8"/>
      <circle cx="44" cy="440" r="8"/>
      <circle cx="44" cy="640" r="8"/>
      <circle cx="44" cy="820" r="8"/>

      <circle cx="1036" cy="260" r="8"/>
      <circle cx="1036" cy="440" r="8"/>
      <circle cx="1036" cy="640" r="8"/>
      <circle cx="1036" cy="820" r="8"/>
    </g>
    <!-- Bottom Badge -->
    <rect x="450" y="1012" width="180" height="44" rx="22" fill="#141E30"/>
    <text x="540" y="1042" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="900" text-anchor="middle" letter-spacing="4">★ FUN ★</text>
  </svg>`;

  await sharp(Buffer.from(frame1Svg))
    .resize(1080, 1080)
    .png()
    .toFile(path.join(framesDir, 'frame-1.png'));

  await sharp(Buffer.from(frame2Svg))
    .resize(1080, 1080)
    .png()
    .toFile(path.join(framesDir, 'frame-2.png'));

  await sharp(Buffer.from(frame3Svg))
    .resize(1080, 1080)
    .png()
    .toFile(path.join(framesDir, 'frame-3.png'));

  console.log('All assets generated successfully!');
}

generateAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
