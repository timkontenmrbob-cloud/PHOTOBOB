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

class PrinterService {
  private adapters: Map<PrinterMode, PrinterAdapter> = new Map();
  private qzPrinterInstance: QZTrayPrinter;
  private isPrintingLocked = false;

  constructor() {
    this.qzPrinterInstance = new QZTrayPrinter();
    this.registerAdapter(this.qzPrinterInstance);
    this.registerAdapter(new WindowsBrowserPrinter());
    this.registerAdapter(new AndroidCleanterPrinter());
  }

  public registerAdapter(adapter: PrinterAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  public getQZPrinter(): QZTrayPrinter {
    return this.qzPrinterInstance;
  }

  public getAdapter(mode: PrinterMode): PrinterAdapter {
    const adapter = this.adapters.get(mode);
    if (!adapter) {
      console.warn(`Adapter ${mode} tidak ditemukan, fallback ke windows-qz.`);
      return this.adapters.get('windows-qz') || this.adapters.get('windows-usb')!;
    }
    return adapter;
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
   * Execute print job through active adapter
   */
  async printPhotobox(params: PrintJobParams): Promise<PrintResult> {
    if (this.isPrintingLocked) {
      return {
        success: false,
        errorMessage: 'Proses cetak sedang berlangsung. Mohon tunggu.',
      };
    }

    this.isPrintingLocked = true;

    try {
      const adapter = this.getAdapter(params.settings.printerMode);
      return await adapter.print(params);
    } finally {
      this.isPrintingLocked = false;
    }
  }
}

export const printerService = new PrinterService();
