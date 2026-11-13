export type ScreenState =
  | 'welcome'
  | 'frame-selection'
  | 'camera'
  | 'preview'
  | 'printing'
  | 'print-confirm'
  | 'success'
  | 'print-error';

export type PrinterMode = 'desktop-usb' | 'android-bluetooth';

export interface FrameItem {
  id: string; // 'frame-1' | 'frame-2' | 'frame-3'
  name: string; // 'Bingkai 1', 'Bingkai 2', 'Bingkai 3'
  styleName: string; // 'Classic', 'Retro', 'Fun'
  defaultUrl: string;
  customDataUrl?: string; // from IndexedDB if uploaded
  isCustom?: boolean;
}

export interface AdminSettings {
  appTitle: string;
  headerText: string;
  footerText: string;
  showDate: boolean;
  showSessionCode: boolean;
  adminPin: string;

  // Active Printing Mode: 'desktop-usb' (Laptop / iWare USB) or 'android-bluetooth' (Samsung A35 / VSC TM-80D)
  printerMode: PrinterMode;

  // Desktop USB Configuration
  desktopPaperWidthMm: number; // default 80
  desktopMarginMm: number; // default 0

  // Thermal Print Configuration
  paperWidth: number; // 80 or 58 mm
  rasterDotWidth: number; // 576, 512, 384, 640 or custom
  marginHorizontal: number; // in dots/px
  headerHeight: number; // in dots/px
  footerHeight: number; // in dots/px
  brightness: number; // multiplier, default 1.05
  contrast: number; // multiplier, default 1.25
  feedLines: number; // blank lines to feed, default 3
  cutPaper: boolean; // default false

  // Printer Bridge (Android Bluetooth)
  cleanterBaseUrl: string; // default "http://localhost:9100"
  mockPrinter: boolean; // default false for production, dev simulation

  // Kiosk Behavior
  autoResetSeconds: number; // default 8
  inactivityTimeoutSeconds: number; // default 60
  enableWakeLock: boolean; // default true
}

export interface CleanterPrinterInfo {
  connected: boolean;
  name?: string;
  address?: string;
  problem?: string | null;
}

export interface CleanterHealthResponse {
  status: string;
  version?: string;
  printer?: CleanterPrinterInfo;
}

export interface CleanterBlockText {
  type: 'text';
  text: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  underline?: boolean;
  size?: 'small' | 'normal' | 'large';
}

export interface CleanterBlockImage {
  type: 'image';
  base64: string; // RAW base64 PNG without data URL prefix
  align?: 'left' | 'center' | 'right';
  dither?: boolean;
}

export interface CleanterBlockFeed {
  type: 'feed';
  lines?: number;
}

export interface CleanterBlockDivider {
  type: 'divider';
  char?: string;
}

export type CleanterBlock =
  | CleanterBlockText
  | CleanterBlockImage
  | CleanterBlockFeed
  | CleanterBlockDivider;

export interface CleanterPrintRequest {
  paperWidth?: number;
  cut?: boolean;
  reference?: string;
  content: CleanterBlock[];
}

export interface CleanterPrintResponse {
  status: 'printed' | 'queued';
  jobId?: string;
}

export interface CleanterErrorResponse {
  error: string;
  detail?: string;
  fix?: string;
}

export interface PrintResult {
  success: boolean;
  needsConfirmation?: boolean; // For desktop-usb where browser print dialog opened and needs confirmation
  jobId?: string;
  errorMessage?: string;
  errorFix?: string;
  isMock?: boolean;
}

export interface PrintJobParams {
  base64Image: string;
  previewUrl: string;
  sessionRef: string;
  settings: AdminSettings;
}

export interface PrinterAdapter {
  readonly id: PrinterMode;
  readonly name: string;
  checkHealth(settings: AdminSettings): Promise<{
    ready: boolean;
    info?: string;
    error?: string;
  }>;
  print(params: PrintJobParams): Promise<PrintResult>;
}

export interface VisitorSession {
  sessionId: string;
  selectedFrameId: string;
  capturedPhotoBlob: Blob | null;
  capturedPhotoUrl: string | null;
  composedPrintBlob: Blob | null;
  composedPrintBase64: string | null;
  composedPreviewUrl: string | null;
  hasPrinted: boolean;
  printStatus: 'idle' | 'printing' | 'confirming' | 'success' | 'error';
  printErrorMessage: string | null;
  printErrorFix: string | null;
  createdAt: number;
}
