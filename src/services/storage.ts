import { AdminSettings } from '../types';

const SETTINGS_KEY = 'photobox_admin_settings_v2';

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

  // Active printer mode: default to desktop-usb if opened on laptop/desktop, or android-bluetooth on mobile
  printerMode: isMobilePlatform() ? 'android-bluetooth' : 'desktop-usb',

  // Desktop USB configuration (for iWare / 80mm USB thermal printer)
  desktopPaperWidthMm: 80,
  desktopMarginMm: 0,

  // Thermal Print Configuration
  paperWidth: 80,
  rasterDotWidth: 576,
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
