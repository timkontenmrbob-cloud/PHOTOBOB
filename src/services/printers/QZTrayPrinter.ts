import qz from 'qz-tray';
import {
  AdminSettings,
  PrinterAdapter,
  PrintJobParams,
  PrintResult,
} from '../../types';

export class QZTrayPrinter implements PrinterAdapter {
  readonly id = 'windows-qz' as const;
  readonly name = 'Windows — Automatic Printing (QZ Tray)';

  private securityInitialized = false;
  private isConnecting = false;

  constructor() {
    // Listeners for WebSocket closures/errors
    try {
      qz.websocket.setClosedCallbacks(() => {
        console.warn('[QZ Tray] Koneksi WebSocket ditutup.');
      });
      qz.websocket.setErrorCallbacks((err: unknown) => {
        console.warn('[QZ Tray] WebSocket error callback:', err);
      });
    } catch (e) {
      console.warn('[QZ Tray] Inisialisasi callback gagal:', e);
    }
  }

  /**
   * Configure certificate and signature handlers if provided.
   * If not configured, QZ Tray displays an authorization dialog with
   * an option to "Remember this decision".
   */
  private configureSecurity(settings: AdminSettings): void {
    if (this.securityInitialized) return;

    try {
      // 1. Digital Certificate Promise
      qz.security.setCertificatePromise((resolve: (cert?: string) => void) => {
        if (settings.qzCertificateUrl && settings.qzCertificateUrl.trim() !== '') {
          fetch(settings.qzCertificateUrl)
            .then((res) => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.text();
            })
            .then((cert) => resolve(cert.trim()))
            .catch((err) => {
              console.warn('[QZ Tray] Gagal mengunduh sertifikat:', err);
              resolve(undefined);
            });
        } else {
          // Dev / Unsigned mode
          resolve(undefined);
        }
      });

      // 2. Request Signing Promise (SHA-512)
      qz.security.setSignatureAlgorithm('SHA512');
      qz.security.setSignaturePromise((toSign: string) => {
        return (resolve: (sig?: string) => void) => {
          if (settings.qzSignatureEndpoint && settings.qzSignatureEndpoint.trim() !== '') {
            fetch(settings.qzSignatureEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ request: toSign }),
            })
              .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.text();
              })
              .then((signature) => {
                try {
                  const parsed = JSON.parse(signature);
                  resolve(parsed.signature || signature.trim());
                } catch {
                  resolve(signature.trim());
                }
              })
              .catch((err) => {
                console.warn('[QZ Tray] Gagal meminta tanda tangan dari server:', err);
                resolve(undefined);
              });
          } else {
            resolve(undefined);
          }
        };
      });

      this.securityInitialized = true;
    } catch (err) {
      console.warn('[QZ Tray] Error saat mengkonfigurasi security handler:', err);
    }
  }

  /**
   * Connect to QZ Tray WebSocket if not already active.
   * Supports intelligent fallback: tries secure first, then insecure if on localhost.
   */
  public async ensureConnected(settings: AdminSettings): Promise<boolean> {
    if (qz.websocket.isActive()) {
      return true;
    }

    if (this.isConnecting) {
      // Wait up to 3 seconds for existing attempt
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 100));
        if (qz.websocket.isActive()) return true;
      }
    }

    this.isConnecting = true;
    this.configureSecurity(settings);

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const host = settings.qzHost || 'localhost';

    try {
      // Connect using configured or detected security preference
      await qz.websocket.connect({
        host,
        usingSecure: settings.qzUseSecure ?? isHttps,
        retries: 2,
        delay: 1,
      });
      return true;
    } catch (err) {
      console.warn('[QZ Tray] Percobaan koneksi primer gagal, mencoba alternatif...', err);
      // If we failed and are running over HTTP or localhost, attempt non-secure fallback
      if (!isHttps || host === 'localhost' || host === '127.0.0.1') {
        try {
          await qz.websocket.connect({
            host,
            usingSecure: false,
            retries: 1,
            delay: 1,
          });
          return true;
        } catch (fallbackErr) {
          console.error('[QZ Tray] Gagal koneksi ke QZ Tray (insecure fallback):', fallbackErr);
          throw fallbackErr;
        }
      }
      throw err;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Fetch all printers recognized by the Windows OS via QZ Tray
   */
  public async listPrinters(settings: AdminSettings): Promise<string[]> {
    await this.ensureConnected(settings);
    const found = await qz.printers.find();
    if (Array.isArray(found)) {
      return found;
    } else if (typeof found === 'string') {
      return [found];
    }
    return [];
  }

  /**
   * Check connection to QZ Tray and verify target printer presence
   */
  async checkHealth(settings: AdminSettings): Promise<{
    ready: boolean;
    info?: string;
    error?: string;
  }> {
    try {
      await this.ensureConnected(settings);

      const targetPrinter = settings.qzPrinterName?.trim();
      if (!targetPrinter) {
        return {
          ready: false,
          error:
            'Printer QZ Tray belum dipilih. Silakan pilih printer iWare IW D260UL di menu Pengaturan Kiosk Admin.',
        };
      }

      // Check if target printer is registered in Windows
      try {
        const matched = await qz.printers.find(targetPrinter);
        const printerName = Array.isArray(matched) ? matched[0] : matched;

        if (printerName) {
          return {
            ready: true,
            info: `QZ Tray aktif terhubung ke printer "${printerName}". Siap mencetak 1-klik otomatis.`,
          };
        } else {
          return {
            ready: false,
            error: `Printer "${targetPrinter}" tidak ditemukan pada daftar printer Windows.`,
          };
        }
      } catch (findErr) {
        return {
          ready: false,
          error: `Printer "${targetPrinter}" tidak terdeteksi di Windows: ${(findErr as Error).message}`,
        };
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || String(err);
      return {
        ready: false,
        error: `QZ Tray tidak aktif: ${errorMsg}. Pastikan aplikasi QZ Tray sedang berjalan di latar belakang Windows.`,
      };
    }
  }

  /**
   * Send the composed photobox image directly to QZ Tray.
   * Completely bypasses window.print() and the browser print dialog.
   */
  async print(params: PrintJobParams): Promise<PrintResult> {
    const { settings, base64Image, sessionRef } = params;
    const targetPrinter = settings.qzPrinterName?.trim();

    if (!targetPrinter) {
      return {
        success: false,
        errorMessage: 'Printer target belum ditentukan pada pengaturan Admin.',
        errorFix:
          'Buka menu Pengaturan Admin, lalu pilih nama printer USB (misal: "iWare IW D260UL" atau "POS-80").',
      };
    }

    try {
      // 1. Ensure WebSocket connection
      await this.ensureConnected(settings);

      // 2. Validate clean base64 data
      const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
      if (!cleanBase64 || cleanBase64.length === 0) {
        return {
          success: false,
          errorMessage: 'Data gambar cetak kosong atau tidak valid.',
          errorFix: 'Silakan ambil foto ulang dan ulangi proses pencetakan.',
        };
      }

      // 3. Prepare Print Payload
      if (settings.qzUseRawEscpos) {
        // --- MODE A: RAW ESC/POS MODE ---
        // Sends raw graphic raster commands and feed/cut directly to the ESC/POS printer
        const config = qz.configs.create(targetPrinter, {
          encoding: 'UTF-8',
          rasterize: true,
        });

        const printData: any[] = [
          {
            type: 'raw',
            format: 'image',
            flavor: 'base64',
            data: cleanBase64,
            options: {
              language: 'ESCPOS',
              dotDensity: 'double',
            },
          },
        ];

        if (settings.qzFeedAndCut) {
          // ESC d 3 (feed 3 lines) -> \x1B\x64\x03
          // GS V 66 0 (feed paper & cut) -> \x1D\x56\x42\x00
          printData.push('\x1Bd\x03');
          printData.push('\x1DV\x42\x00');
        }

        await qz.print(config, printData as any);
      } else {
        // --- MODE B: PIXEL DRIVER MODE (RECOMMENDED DEFAULT) ---
        // Renders through the Windows Printer Driver for iWare IW D260UL
        // Guarantees exact sizing, margins, and paper calibration
        const printableWidthMm = settings.windowsPrintableWidthMm || 72;
        const pageHeightMm = settings.windowsPageHeightMm || 120;

        const config = qz.configs.create(targetPrinter, {
          margins: settings.windowsMarginMm || 0,
          rasterize: true,
          colorType: 'blackwhite',
          scaleContent: true,
          density: 203, // 203 DPI standard for 80mm thermal receipt
          units: 'mm',
          size: {
            width: printableWidthMm,
            height: pageHeightMm,
          },
          jobName: `PHOTOBOX_${sessionRef}`,
        });

        const printData: any[] = [
          {
            type: 'pixel',
            format: 'image',
            flavor: 'base64',
            data: cleanBase64,
          },
        ];

        await qz.print(config, printData as any);
      }

      // 4. Job sent successfully to QZ Tray
      // Per Section 5 of specification:
      // Return needsConfirmation: true to trigger physical verification
      // ("Apakah foto sudah tercetak?") to protect against empty paper roll or physical disconnects.
      return {
        success: true,
        needsConfirmation: true,
        jobId: `QZ-${sessionRef}`,
      };
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || String(err);
      console.error('[QZ Tray] Kesalahan saat mencetak:', err);

      let fix = 'Periksa apakah kabel USB printer iWare IW D260UL sudah terhubung dan lampu indikator menyala.';
      if (errorMsg.includes('Unable to establish') || errorMsg.includes('WebSocket')) {
        fix = 'Aplikasi QZ Tray di Windows belum berjalan. Silakan buka QZ Tray dari Start Menu / Desktop.';
      } else if (errorMsg.includes('not found') || errorMsg.includes('Unknown printer')) {
        fix = `Printer "${targetPrinter}" tidak ditemukan. Pastikan driver iWare sudah terpasang di Devices and Printers Windows.`;
      } else if (errorMsg.includes('Permission') || errorMsg.includes('denied') || errorMsg.includes('Blocked')) {
        fix = 'Izin cetak belum disetujui pada dialog QZ Tray. Pilih "Allow" dan centang "Remember this decision".';
      }

      return {
        success: false,
        errorMessage: `Gagal mencetak otomatis via QZ Tray: ${errorMsg}`,
        errorFix: fix,
      };
    }
  }
}
