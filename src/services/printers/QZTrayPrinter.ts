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

  private connectPromise: Promise<boolean> | null = null;

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

    if (this.connectPromise) {
      return this.connectPromise;
    }

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const useSecure = settings.qzUseSecure !== undefined ? settings.qzUseSecure : isHttps;
    const host = settings.qzHost || 'localhost';

    console.log(
      `[QZTrayPrinter] Menghubungi QZ Tray. Host: "${host}", Secure (WSS): ${useSecure}`
    );

    // Single shared connection promise with 7-second timeout protection
    this.connectPromise = (async () => {
      const timeoutMs = 7000;
      let timer: any;

      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(
            new Error(
              'Koneksi ke QZ Tray timeout (7 detik). Pastikan software QZ Tray sedang berjalan di Windows.'
            )
          );
        }, timeoutMs);
      });

      const connectAttempt = async () => {
        // Fast connection using official QZ Tray host fallback chain
        const connectOptions: any = {
          host: [host, 'localhost.qz.io', 'localhost', '127.0.0.1'],
          usingSecure: useSecure,
          retries: 0,
          delay: 0,
        };

        try {
          await qz.websocket.connect(connectOptions);
          console.log('[QZTrayPrinter] QZ Tray WebSocket terhubung sukses!');
          return true;
        } catch (err: unknown) {
          console.warn('[QZTrayPrinter] Percobaan koneksi primer gagal, mencoba default connect():', err);
          // Fallback to standard connect without overriding config
          await qz.websocket.connect();
          console.log('[QZTrayPrinter] QZ Tray default connect() sukses!');
          return true;
        }
      };

      try {
        await Promise.race([connectAttempt(), timeoutPromise]);
        return true;
      } catch (err: unknown) {
        console.error('[QZTrayPrinter] Koneksi WebSocket ke QZ Tray gagal:', err);
        throw err;
      } finally {
        if (timer) clearTimeout(timer);
        this.connectPromise = null;
      }
    })();

    return this.connectPromise;
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

      // Check if target printer is registered in Windows with smart fallback
      try {
        let matched = await qz.printers.find(targetPrinter);
        let printerName = Array.isArray(matched) ? matched[0] : matched;

        if (!printerName) {
          const allPrinters = await qz.printers.find();
          const list = Array.isArray(allPrinters) ? allPrinters : [allPrinters];
          const candidate = list.find((p) => /iware|d260|pos|receipt|thermal|80/i.test(p));
          if (candidate) {
            printerName = candidate;
          } else {
            const def = await qz.printers.getDefault();
            if (def) printerName = def;
          }
        }

        if (printerName) {
          return {
            ready: true,
            info: `QZ Tray aktif terhubung ke printer "${printerName}". Siap mencetak 1-klik otomatis.`,
          };
        } else {
          return {
            ready: false,
            error: `Printer "${targetPrinter}" tidak ditemukan pada daftar printer Windows. Pastikan driver iWare terpasang.`,
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

    console.log(`[QZTrayPrinter] print() dipanggil untuk sesi: ${sessionRef}, target konfigurasi: "${targetPrinter}"`);

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

      // 3. Auto-resolve actual printer name in Windows (handles POS-80 vs iWare differences)
      let resolvedPrinter = targetPrinter;
      try {
        const matched = await qz.printers.find(targetPrinter);
        if (matched) {
          resolvedPrinter = Array.isArray(matched) ? matched[0] : matched;
        } else {
          const allPrinters = await qz.printers.find();
          const list = Array.isArray(allPrinters) ? allPrinters : [allPrinters];
          const candidate = list.find((p) => /iware|d260|pos|receipt|thermal|80/i.test(p));
          if (candidate) {
            resolvedPrinter = candidate;
            console.log(`[QZTrayPrinter] Auto-matched printer Windows ke: "${resolvedPrinter}"`);
          } else {
            const def = await qz.printers.getDefault();
            if (def) {
              resolvedPrinter = def;
              console.log(`[QZTrayPrinter] Menggunakan default printer Windows: "${resolvedPrinter}"`);
            }
          }
        }
      } catch (findErr) {
        console.warn('[QZTrayPrinter] Gagal auto-resolve printer, tetap menggunakan:', targetPrinter, findErr);
      }

      // 4. Prepare Print Payload
      let config: any;
      let printData: any[];

      // Direct ESC/POS Hardware Execution (Native for iWare IW D260UL & 80mm thermal receipt printers)
      // Fixes:
      // 1. "hasilnya jadi hitam pekat": set quantization: 'dither', threshold: 128 (default was 'alpha' which turns all opaque pixels solid black)
      // 2. "driver windows malah gak keluar": bypasses Windows GDI print spooler drops by speaking native ESC/POS bytecode
      console.log(`[QZTrayPrinter] Mengirim pekerjaan via Direct ESC/POS ke "${resolvedPrinter}"...`);
      config = qz.configs.create(resolvedPrinter, {
        encoding: 'UTF-8',
        rasterize: false,
      });

      printData = [
        '\x1B\x40', // ESC @ (Initialize printer, reset any previous formatting)
        '\x1B\x61\x01', // ESC a 1 (Center alignment)
        {
          type: 'raw',
          format: 'image',
          flavor: 'base64',
          data: cleanBase64,
          options: {
            language: 'escpos',
            imageEncoding: 'gs_v_0', // Native 203 DPI raster bit image: perfect 1:1 pixel fidelity
            quantization: 'black', // Black-pixel luminance quantization: maps pure 1-bit dithered image directly without solid black alpha bug
            threshold: 128,
          },
        },
        '\x0A', // Line feed to ensure raster buffer is fully flushed to thermal printhead
        '\x1B\x61\x00', // ESC a 0 (Reset to normal left alignment)
      ];

      if (settings.qzFeedAndCut) {
        // Feed 2 lines so cutter cuts cleanly past the bottom edge of the photo
        const feed = settings.feedLines && settings.feedLines > 0 ? Math.min(settings.feedLines, 5) : 2;
        printData.push(`\x1Bd${String.fromCharCode(feed)}`);
        printData.push('\x1DV\x42\x00'); // GS V 66 0 (Cut paper cleanly at cutting position)
      }

      // 4. Send print job with 18-second timeout protection
      const printTimeoutMs = 18000;
      let printTimer: any;
      const printTimeoutPromise = new Promise<never>((_, reject) => {
        printTimer = setTimeout(() => {
          reject(
            new Error(
              'Timeout mencetak ke QZ Tray (18 detik). Periksa apakah muncul dialog izin QZ Tray di layar/taskbar Windows Anda.'
            )
          );
        }, printTimeoutMs);
      });

      try {
        await Promise.race([qz.print(config, printData as any), printTimeoutPromise]);
      } finally {
        if (printTimer) clearTimeout(printTimer);
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
      if (errorMsg.includes('timeout') || errorMsg.includes('Timeout')) {
        fix = 'Waktu respon habis. Buka taskbar Windows dan pastikan dialog izin QZ Tray diklik "Allow" (centang "Remember").';
      } else if (errorMsg.includes('Unable to establish') || errorMsg.includes('WebSocket')) {
        fix = 'Aplikasi QZ Tray di Windows belum berjalan. Buka QZ Tray dari Start Menu / Taskbar.';
      } else if (errorMsg.includes('not found') || errorMsg.includes('Unknown printer')) {
        fix = `Printer "${targetPrinter}" tidak ditemukan. Pastikan driver iWare terdaftar di Devices and Printers Windows.`;
      } else if (errorMsg.includes('Permission') || errorMsg.includes('denied') || errorMsg.includes('Blocked')) {
        fix = 'Izin cetak belum disetujui pada dialog QZ Tray. Pilih "Allow" dan centang "Remember this decision".';
      }

      // Truncate errorMsg if excessively long (e.g. base64 signature, stack trace)
      const cleanInfo = errorMsg.length > 90 ? `${errorMsg.substring(0, 87)}...` : errorMsg;

      // Enforce strict required error message per Section 2:
      return {
        success: false,
        errorMessage: 'Printer tidak terhubung. Silakan panggil petugas.',
        errorFix: `${fix} (Info: ${cleanInfo})`,
      };
    }
  }
}
