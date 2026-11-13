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
   */
  private configureSecurity(settings: AdminSettings): void {
    if (this.securityInitialized) return;

    try {
      // 1. Digital Certificate Promise
      qz.security.setCertificatePromise((resolve: (cert?: string) => void) => {
        if (settings.qzCertificateUrl && settings.qzCertificateUrl.trim() !== '') {
          console.log('[QZ Tray] Mengambil sertifikat dari:', settings.qzCertificateUrl);
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
   * Connect to QZ Tray WebSocket.
   * Documented default ports:
   *   - Secure (WSS)   : 8181 (cycles through 8282, 8383, 8484)
   *   - Insecure (WS)  : 8182 (cycles through 8283, 8384, 8485)
   * When on HTTPS (e.g. Vercel deployment), WSS (port 8181) is mandatory.
   */
  public async ensureConnected(settings: AdminSettings): Promise<boolean> {
    if (qz.websocket.isActive()) {
      return true;
    }

    if (this.isConnecting) {
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 100));
        if (qz.websocket.isActive()) return true;
      }
    }

    this.isConnecting = true;
    this.configureSecurity(settings);

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const useSecure = settings.qzUseSecure !== undefined ? settings.qzUseSecure : isHttps;
    const host = settings.qzHost || 'localhost';

    console.log(
      `[QZTrayPrinter] Menghubungi QZ Tray. Host: "${host}", Secure (WSS): ${useSecure}, Port target: ${
        useSecure ? '8181 (WSS)' : '8182 (WS)'
      }`
    );

    try {
      // Connect using exact documented QZ Tray port mapping:
      // Secure (WSS) = [8181, 8282, 8383, 8484]
      // Insecure (WS) = [8182, 8283, 8384, 8485]
      const connectOptions: any = {
        host: [host, 'localhost', '127.0.0.1'],
        usingSecure: useSecure,
        retries: 2,
        delay: 1,
        port: useSecure
          ? { secure: [8181, 8282, 8383, 8484], insecure: [] }
          : { secure: [], insecure: [8182, 8283, 8384, 8485] },
      };

      await qz.websocket.connect(connectOptions);
      console.log('[QZTrayPrinter] QZ Tray WebSocket terhubung sukses!');
      return true;
    } catch (err) {
      console.error('[QZTrayPrinter] Percobaan koneksi primer gagal:', err);

      // On localhost HTTP only, attempt insecure fallback
      if (!isHttps) {
        try {
          console.log('[QZTrayPrinter] Mencoba fallback insecure ws://localhost:8182...');
          await qz.websocket.connect({
            host: ['localhost', '127.0.0.1'],
            usingSecure: false,
            port: { secure: [], insecure: [8182, 8283, 8384, 8485] },
            retries: 1,
            delay: 1,
          });
          console.log('[QZTrayPrinter] Fallback insecure berhasil!');
          return true;
        } catch (fallbackErr) {
          console.error('[QZTrayPrinter] Fallback insecure juga gagal:', fallbackErr);
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
            info: `QZ Tray aktif terhubung ke printer "${printerName}". Siap mencetak 1-klik otomatis (Port ${
              settings.qzUseSecure ? '8181 WSS' : '8182 WS'
            }).`,
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
        error: `Printer tidak terhubung. Silakan panggil petugas. (QZ Tray: ${errorMsg})`,
      };
    }
  }

  /**
   * Send the composed photobox image directly to QZ Tray.
   * STRICT GUARANTEE: Never invokes window.print() or the browser print dialog.
   */
  async print(params: PrintJobParams): Promise<PrintResult> {
    const { settings, base64Image, sessionRef } = params;
    const targetPrinter = settings.qzPrinterName?.trim() || 'iWare IW D260UL';

    console.log(`[QZTrayPrinter] print() dipanggil untuk sesi: ${sessionRef}, target: "${targetPrinter}"`);

    try {
      // 1. Ensure WebSocket connection (NEVER fallback to browser printing)
      await this.ensureConnected(settings);

      // 2. Validate clean base64 data
      const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
      if (!cleanBase64 || cleanBase64.length === 0) {
        console.error('[QZTrayPrinter] Base64 image kosong!');
        return {
          success: false,
          errorMessage: 'Data gambar cetak tidak valid.',
          errorFix: 'Silakan ambil foto ulang dan ulangi proses pencetakan.',
        };
      }

      // 3. Prepare Print Payload
      if (settings.qzUseRawEscpos) {
        // --- MODE A: RAW ESC/POS MODE ---
        console.log('[QZTrayPrinter] Mengirim pekerjaan via Raw ESC/POS...');
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
        // --- MODE B: PIXEL DRIVER MODE (RECOMMENDED DEFAULT FOR iWare) ---
        console.log('[QZTrayPrinter] Mengirim pekerjaan via Windows Driver (Raster Pixel)...');
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

      console.log('[QZTrayPrinter] qz.print() berhasil terkirim ke driver printer!');

      // Job successfully handed off to QZ Tray
      // Needs physical confirmation ("Apakah foto sudah tercetak?") to protect against empty paper
      return {
        success: true,
        needsConfirmation: true,
        jobId: `QZ-${sessionRef}`,
      };
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || String(err);
      console.error('[QZTrayPrinter] Gagal mencetak ke QZ Tray:', err);

      let fix = 'Periksa apakah kabel USB printer iWare IW D260UL sudah terhubung dan lampu indikator menyala.';
      if (errorMsg.includes('Unable to establish') || errorMsg.includes('WebSocket')) {
        fix = 'Aplikasi QZ Tray di Windows belum berjalan. Buka QZ Tray dari Start Menu / Taskbar.';
      } else if (errorMsg.includes('not found') || errorMsg.includes('Unknown printer')) {
        fix = `Printer "${targetPrinter}" tidak ditemukan. Pastikan driver iWare terdaftar di Devices and Printers Windows.`;
      } else if (errorMsg.includes('Permission') || errorMsg.includes('denied') || errorMsg.includes('Blocked')) {
        fix = 'Izin cetak belum disetujui pada dialog QZ Tray. Pilih "Allow" dan centang "Remember this decision".';
      }

      // Enforce strict required error message per Section 2:
      return {
        success: false,
        errorMessage: 'Printer tidak terhubung. Silakan panggil petugas.',
        errorFix: fix,
      };
    }
  }
}
