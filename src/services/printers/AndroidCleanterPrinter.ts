import {
  AdminSettings,
  CleanterHealthResponse,
  CleanterPrintRequest,
  CleanterPrintResponse,
  CleanterErrorResponse,
  PrinterAdapter,
  PrintJobParams,
  PrintResult,
} from '../../types';

export class AndroidCleanterPrinter implements PrinterAdapter {
  readonly id = 'android-bluetooth';
  readonly name = 'Android Bluetooth (Cleanter)';

  async checkHealth(settings: AdminSettings): Promise<{
    ready: boolean;
    info?: string;
    error?: string;
  }> {
    const url = `${settings.cleanterBaseUrl.replace(/\/$/, '')}/health`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          ready: false,
          error: `Cleanter mengembalikan status HTTP ${response.status}`,
        };
      }

      const data = (await response.json()) as CleanterHealthResponse;
      if (data.printer?.connected) {
        return {
          ready: true,
          info: `Cleanter v${data.version || '1.1'} — Printer: ${data.printer.name || 'Printer Bluetooth'} (${data.printer.address || 'Bluetooth OK'})`,
        };
      } else {
        return {
          ready: false,
          error: `Printer belum terhubung di Cleanter: ${data.printer?.problem || 'Periksa koneksi Bluetooth'}`,
        };
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        return {
          ready: false,
          error: 'Koneksi ke Cleanter (localhost:9100) timeout. Pastikan aplikasi Cleanter aktif di Android.',
        };
      }
      return {
        ready: false,
        error:
          'Tidak dapat terhubung ke Cleanter bridge. Pastikan aplikasi Cleanter berjalan dan izin Local Network telah diberikan.',
      };
    }
  }

  async print(params: PrintJobParams): Promise<PrintResult> {
    const { base64Image, sessionRef, settings } = params;

    if (settings.mockPrinter) {
      console.warn('Mode simulasi Cleanter aktif.');
      await new Promise((res) => setTimeout(res, 2000));
      return {
        success: true,
        jobId: `mock-${Date.now()}`,
        isMock: true,
      };
    }

    const baseUrl = settings.cleanterBaseUrl.replace(/\/$/, '');
    const printUrl = `${baseUrl}/print`;

    const payload: CleanterPrintRequest = {
      paperWidth: settings.paperWidth || 80,
      cut: settings.cutPaper || false,
      reference: sessionRef.slice(0, 64),
      content: [
        {
          type: 'image',
          base64: base64Image,
          align: 'center',
          dither: false, // The compositor already supplies the final one-bit dotted raster.
        },
        {
          type: 'feed',
          lines: Math.max(1, settings.feedLines || 3),
        },
      ],
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(printUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 200) {
        const result = (await response.json()) as CleanterPrintResponse;
        return {
          success: true,
          jobId: result.jobId,
        };
      }

      if (response.status === 503) {
        const errorData = (await response.json()) as CleanterErrorResponse;
        return {
          success: false,
          errorMessage: this.translateErrorCode(errorData.error, errorData.detail),
          errorFix: errorData.fix || 'Periksa status printer bluetooth dan ketersediaan kertas.',
        };
      }

      if (response.status === 400) {
        const errorData = (await response.json()) as CleanterErrorResponse;
        return {
          success: false,
          errorMessage: 'Permintaan cetak tidak valid (HTTP 400). ' + (errorData.detail || ''),
        };
      }

      return {
        success: false,
        errorMessage: `Printer mengembalikan kode status ${response.status}.`,
      };
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        return {
          success: false,
          errorMessage: 'Waktu koneksi pencetakan habis (timeout).',
          errorFix: 'Periksa apakah printer thermal Bluetooth terhubung dan memiliki daya cukup.',
        };
      }
      return {
        success: false,
        errorMessage: 'Gagal menghubungi Cleanter printer bridge.',
        errorFix:
          'Pastikan aplikasi Cleanter aktif pada HP Android dan bluetooth printer sudah tersambung.',
      };
    }
  }

  private translateErrorCode(code: string, detail?: string): string {
    switch (code) {
      case 'bluetooth_permission_missing':
        return 'Izin Bluetooth belum diberikan pada aplikasi Cleanter.';
      case 'bluetooth_disabled':
        return 'Bluetooth pada ponsel Android dalam keadaan nonaktif.';
      case 'printer_not_connected':
        return 'Printer Bluetooth belum terhubung ke Cleanter.';
      case 'printer_not_paired':
        return 'Printer belum dipasangkan (paired) di pengaturan Bluetooth Android.';
      case 'printer_unreachable':
        return 'Printer Bluetooth tidak merespons. Periksa daya dan kertas.';
      default:
        return detail || 'Terjadi gangguan komunikasi dengan printer thermal.';
    }
  }
}
