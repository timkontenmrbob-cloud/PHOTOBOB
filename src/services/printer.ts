import {
  AdminSettings,
  PrinterAdapter,
  PrinterMode,
  PrintJobParams,
  PrintResult,
} from '../types';
import { AndroidCleanterPrinter } from './printers/AndroidCleanterPrinter';
import { WindowsBrowserPrinter } from './printers/WindowsBrowserPrinter';
import { QZTrayPrinter } from './printers/QZTrayPrinter';

export interface PrinterDiagnosticLog {
  timestamp: string;
  mode: PrinterMode;
  printerName: string;
  adapterName: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  detail?: string;
}

class PrinterService {
  private qzPrinter: QZTrayPrinter;
  private browserPrinter: WindowsBrowserPrinter;
  private cleanterPrinter: AndroidCleanterPrinter;
  private isPrintingLocked = false;
  private lastDiagnostics: PrinterDiagnosticLog | null = null;

  constructor() {
    this.qzPrinter = new QZTrayPrinter();
    this.browserPrinter = new WindowsBrowserPrinter();
    this.cleanterPrinter = new AndroidCleanterPrinter();
  }

  public getQZPrinter(): QZTrayPrinter {
    return this.qzPrinter;
  }

  public getLastDiagnostics(): PrinterDiagnosticLog | null {
    return this.lastDiagnostics;
  }

  /**
   * Strictly resolve adapter based on persisted mode.
   * STRICT ENFORCEMENT: NEVER fallback to browser printing if QZ Tray is selected!
   */
  public getAdapter(mode: PrinterMode): PrinterAdapter {
    if (mode === 'windows-qz') {
      return this.qzPrinter;
    }
    if (mode === 'android-bluetooth') {
      return this.cleanterPrinter;
    }
    if (mode === 'windows-usb') {
      return this.browserPrinter;
    }
    // Absolute fallback: QZTrayPrinter (NEVER WindowsBrowserPrinter / window.print)
    return this.qzPrinter;
  }

  /**
   * Check health of currently selected printer mode
   */
  async checkHealth(settings: AdminSettings): Promise<{
    ready: boolean;
    info?: string;
    error?: string;
  }> {
    const adapter = this.getAdapter(settings.printerMode);
    return adapter.checkHealth(settings);
  }

  /**
   * Execute print job through active adapter with strict routing.
   *
   * STRICT GUARANTEE:
   * - If mode === 'windows-qz': ONLY calls qz.print() via QZTrayPrinter.
   * - NEVER calls window.print() or invokes WindowsBrowserPrinter in QZ Tray mode.
   * - NEVER silently falls back to browser printing if QZ Tray encounters an error.
   */
  async printPhotobox(params: PrintJobParams): Promise<PrintResult> {
    if (this.isPrintingLocked) {
      return {
        success: false,
        errorMessage: 'Proses cetak sedang berlangsung. Mohon tunggu.',
      };
    }

    const { settings, sessionRef } = params;
    const mode = settings.printerMode;
    const printerName =
      mode === 'windows-qz'
        ? settings.qzPrinterName || 'iWare IW D260UL'
        : mode === 'windows-usb'
        ? 'iWare IW D260UL (Browser Print)'
        : 'VSC TM-80D (Android Cleanter)';

    const adapter = this.getAdapter(mode);

    // Development & Diagnostic Logging (Requirement 5)
    console.group(`[PrinterService] Permintaan Cetak [${sessionRef}]`);
    console.log(`• Active Printer Mode : ${mode}`);
    console.log(`• Target Printer Name : ${printerName}`);
    console.log(`• Selected Adapter    : ${adapter.name}`);
    console.log(`• Timestamp           : ${new Date().toISOString()}`);
    console.groupEnd();

    this.lastDiagnostics = {
      timestamp: new Date().toLocaleTimeString('id-ID'),
      mode,
      printerName,
      adapterName: adapter.name,
      status: 'pending',
      message: `Mengirim pekerjaan cetak ke ${adapter.name}...`,
    };

    this.isPrintingLocked = true;

    try {
      // 1. STRICT ROUTE 1: WINDOWS QZ TRAY (AUTOMATIC SILENT PRINT)
      if (mode === 'windows-qz') {
        console.log('[PrinterService] -> Eksekusi via QZTrayPrinter (window.print() DILARANG KERAS)');
        const res = await this.qzPrinter.print(params);

        if (res.success) {
          console.log('[PrinterService] -> QZ Tray Print BERHASIL diajukan ke printer driver.');
          this.lastDiagnostics.status = 'success';
          this.lastDiagnostics.message = `Berhasil dikirim ke "${printerName}" via QZ Tray.`;
        } else {
          console.error('[PrinterService] -> QZ Tray Print GAGAL:', res.errorMessage);
          this.lastDiagnostics.status = 'error';
          this.lastDiagnostics.message = res.errorMessage || 'Gagal mencetak via QZ Tray.';
          this.lastDiagnostics.detail = res.errorFix;
        }

        // Return QZ Tray result directly — NEVER FALL BACK TO BROWSER PRINTING!
        return res;
      }

      // 2. STRICT ROUTE 2: ANDROID BLUETOOTH (CLEANTER BRIDGE)
      if (mode === 'android-bluetooth') {
        console.log('[PrinterService] -> Eksekusi via AndroidCleanterPrinter');
        const res = await this.cleanterPrinter.print(params);
        this.lastDiagnostics.status = res.success ? 'success' : 'error';
        this.lastDiagnostics.message = res.success
          ? 'Berhasil dikirim ke printer via Cleanter bridge.'
          : (res.errorMessage || 'Gagal mencetak via Cleanter.');
        this.lastDiagnostics.detail = res.errorFix;
        return res;
      }

      // 3. STRICT ROUTE 3: WINDOWS USB BROWSER PRINT (ONLY this mode is permitted to call window.print())
      if (mode === 'windows-usb') {
        console.log('[PrinterService] -> Eksekusi via WindowsBrowserPrinter (window.print() native dialog)');
        const res = await this.browserPrinter.print(params);
        this.lastDiagnostics.status = res.success ? 'success' : 'error';
        this.lastDiagnostics.message = res.success
          ? 'Dialog cetak browser berhasil dibuka.'
          : (res.errorMessage || 'Gagal membuka dialog cetak browser.');
        return res;
      }

      // 4. UNKNOWN MODE: STRICT DEFAULT TO QZ TRAY (NEVER BROWSER PRINT)
      console.warn(`[PrinterService] Mode "${mode}" tidak valid, fallback ke QZTrayPrinter.`);
      const res = await this.qzPrinter.print(params);
      this.lastDiagnostics.status = res.success ? 'success' : 'error';
      this.lastDiagnostics.message = res.errorMessage || 'Cetak melalui adapter default QZ Tray.';
      return res;
    } catch (err: unknown) {
      const errMsg = (err as Error)?.message || String(err);
      console.error('[PrinterService] Pengecualian tak terduga saat mencetak:', err);

      this.lastDiagnostics.status = 'error';
      this.lastDiagnostics.message = 'Printer tidak terhubung. Silakan panggil petugas.';
      this.lastDiagnostics.detail = errMsg;

      // In QZ Tray mode, return mandated exact error message:
      return {
        success: false,
        errorMessage: 'Printer tidak terhubung. Silakan panggil petugas.',
        errorFix: `Detail: ${errMsg}`,
      };
    } finally {
      this.isPrintingLocked = false;
    }
  }
}

export const printerService = new PrinterService();
