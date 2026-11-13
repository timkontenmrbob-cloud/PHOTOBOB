import { AdminSettings } from '../types';

const SETTINGS_KEY = 'photobox_admin_settings_v4';

function isMobilePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export const DEFAULT_SETTINGS: AdminSettings = {
  appTitle: 'PHOTOBOX',
  headerText: 'PHOTOBOX MEMORY',
  footerText: 'Capture Your Moment',
  showDate: true,
  showSessionCode: true,
  adminPin: '1234',

  // Active printer mode: default to windows-qz on laptop/desktop, android-bluetooth on mobile
  printerMode: isMobilePlatform() ? 'android-bluetooth' : 'windows-qz',

  // QZ Tray Automatic Printing Configuration (Windows iWare IW D260UL)
  qzPrinterName: 'iWare IW D260UL',
  qzHost: 'localhost',
  qzPort: 8182,
  qzUseSecure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  qzCertificateUrl: '',
  qzSignatureEndpoint: '',
  qzUseRawEscpos: false, // false for Windows driver raster/pixel mode, true for direct ESC/POS bytes
  qzFeedAndCut: true,

  // Windows USB Browser Configuration (iWare IW D260UL / 80mm ESC/POS)
  windowsPaperWidthMm: 80,
  windowsPrintableWidthMm: 72,
  windowsPageHeightMm: 120, // default 120mm receipt length, adjustable
  windowsMarginMm: 0, // default 0mm for continuous thermal roll

  // Thermal Print Calibration (Raster & Canvas)
  paperWidth: 80,
  rasterDotWidth: 576, // 72mm at 203 DPI = 576 dots
  marginHorizontal: 12,
  headerHeight: 110,
  footerHeight: 110,
  brightness: 1.05,
  contrast: 1.25,
  feedLines: 3,
  cutPaper: false,

  // Printer Bridge (Android Bluetooth)
  cleanterBaseUrl: 'http://localhost:9100',
  mockPrinter: false,

  autoResetSeconds: 8,
  inactivityTimeoutSeconds: 60,
  enableWakeLock: true,
};

export function loadSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.warn('Failed to parse settings from localStorage, using defaults', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AdminSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage', error);
  }
}

export function resetSettingsToDefault(): AdminSettings {
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}
