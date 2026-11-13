import { AdminSettings } from '../types';

const SETTINGS_KEY = 'photobox_admin_settings_v5';

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

  // Active printer mode: STRICT DEFAULT is 'windows-qz' on desktop, 'android-bluetooth' on mobile
  // 'windows-usb' (window.print()) is ONLY active if explicitly selected by admin.
  printerMode: isMobilePlatform() ? 'android-bluetooth' : 'windows-qz',

  // QZ Tray Automatic Printing Configuration (Windows iWare IW D260UL)
  qzPrinterName: 'iWare IW D260UL',
  qzHost: 'localhost',
  qzPort: 8181, // Default documented secure port for QZ Tray is 8181 (WSS)
  qzUseSecure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  qzCertificateUrl: '',
  qzSignatureEndpoint: '',
  qzUseRawEscpos: true, // true = Direct ESC/POS bytecode (0mm margin, zero top whitespace, recommended for iWare 80mm thermal)
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
  headerHeight: 75,
  footerHeight: 75,
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
    // 1. Check v5
    let raw = localStorage.getItem(SETTINGS_KEY);

    // 2. Migration from older versions (v4, v3)
    if (!raw) {
      const olderRaw =
        localStorage.getItem('photobox_admin_settings_v4') ||
        localStorage.getItem('photobox_admin_settings_v3');

      if (olderRaw) {
        try {
          const oldParsed = JSON.parse(olderRaw);
          // If running on desktop, ensure default is windows-qz instead of stale windows-usb
          const migratedMode = isMobilePlatform()
            ? 'android-bluetooth'
            : oldParsed.printerMode === 'windows-usb'
            ? 'windows-qz'
            : oldParsed.printerMode || 'windows-qz';

          const migrated: AdminSettings = {
            ...DEFAULT_SETTINGS,
            ...oldParsed,
            printerMode: migratedMode,
            qzPort: 8181,
          };
          saveSettings(migrated);
          console.log('[Storage] Pengaturan dimigrasikan ke v5 dengan mode aktif:', migrated.printerMode);
          return migrated;
        } catch {
          // ignore parse error
        }
      }
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(raw);
    const resolvedMode =
      parsed.printerMode || (isMobilePlatform() ? 'android-bluetooth' : 'windows-qz');

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      printerMode: resolvedMode,
      // Ensure correct port 8181 for secure QZ Tray
      qzPort: parsed.qzPort === 8182 ? 8181 : (parsed.qzPort || 8181),
    };
  } catch (error) {
    console.warn('Failed to parse settings from localStorage, using defaults', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AdminSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    console.log(`[Storage] Pengaturan disimpan ke ${SETTINGS_KEY}. Mode: ${settings.printerMode}, Printer: ${settings.qzPrinterName}`);
  } catch (error) {
    console.error('Failed to save settings to localStorage', error);
  }
}

export function resetSettingsToDefault(): AdminSettings {
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}
