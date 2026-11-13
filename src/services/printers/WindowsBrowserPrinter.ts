import {
  AdminSettings,
  PrinterAdapter,
  PrintJobParams,
  PrintResult,
} from '../../types';

export class WindowsBrowserPrinter implements PrinterAdapter {
  readonly id = 'windows-usb';
  readonly name = 'Windows USB (iWare IW D260UL)';

  async checkHealth(_settings: AdminSettings): Promise<{
    ready: boolean;
    info?: string;
    error?: string;
  }> {
    if (typeof window === 'undefined' || typeof window.print !== 'function') {
      return {
        ready: false,
        error: 'Pencetakan browser (window.print) tidak didukung pada sistem ini.',
      };
    }

    return {
      ready: true,
      info: 'Windows Browser Printer siap. Kompatibel dengan driver iWare IW D260UL (80mm) & Chrome Kiosk Printing.',
    };
  }

  async print(params: PrintJobParams): Promise<PrintResult> {
    const { previewUrl, settings } = params;

    if (settings.mockPrinter) {
      console.warn('Mode simulasi Windows USB aktif.');
      await new Promise((res) => setTimeout(res, 1200));
      return {
        success: true,
        needsConfirmation: true,
        jobId: `mock-win-${Date.now()}`,
        isMock: true,
      };
    }

    if (typeof window === 'undefined') {
      return {
        success: false,
        errorMessage: 'Objek window browser tidak tersedia.',
      };
    }

    try {
      // 1. Prepare / update the dedicated print-only DOM container
      let printContainer = document.getElementById('photobox-print-target');
      if (!printContainer) {
        printContainer = document.createElement('div');
        printContainer.id = 'photobox-print-target';
        document.body.appendChild(printContainer);
      }

      // Populate print container with receipt image (header + 1:1 photo + footer combined)
      printContainer.innerHTML = `
        <div class="photobox-receipt-wrapper">
          <img src="${previewUrl}" alt="Photobox Struk iWare" id="photobox-print-image" />
        </div>
      `;

      // 2. Inject or update dynamic @media print styles sized for 80mm roll
      const paperWidthMm = settings.windowsPaperWidthMm || 80;
      const printableWidthMm = settings.windowsPrintableWidthMm || 72;
      const pageHeightMm = settings.windowsPageHeightMm || 120;
      const marginMm = settings.windowsMarginMm || 0;

      let styleEl = document.getElementById('photobox-print-dynamic-styles') as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'photobox-print-dynamic-styles';
        document.head.appendChild(styleEl);
      }

      // We support printer-driver page size calibration with zero margins to prevent blank second pages
      styleEl.textContent = `
        @media print {
          @page {
            size: ${paperWidthMm}mm ${pageHeightMm}mm;
            margin: ${marginMm}mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            width: ${paperWidthMm}mm !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* Completely hide all UI buttons, navigation, and modals */
          #root {
            display: none !important;
          }
          /* Render only the dedicated print container without extra pages */
          #photobox-print-target {
            display: block !important;
            width: ${paperWidthMm}mm !important;
            max-width: ${paperWidthMm}mm !important;
            margin: 0 auto !important;
            padding: ${marginMm}mm !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
          }
          .photobox-receipt-wrapper {
            width: 100% !important;
            max-width: ${printableWidthMm}mm !important;
            margin: 0 auto !important;
            text-align: center !important;
            page-break-inside: avoid !important;
          }
          #photobox-print-image {
            width: 100% !important;
            max-width: ${printableWidthMm}mm !important;
            height: auto !important;
            display: block !important;
            margin: 0 auto !important;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            image-rendering: pixelated;
          }
        }
        @media screen {
          #photobox-print-target {
            display: none !important;
          }
        }
      `;

      // 3. Ensure image is fully loaded and decoded before triggering window.print()
      const img = printContainer.querySelector('#photobox-print-image') as HTMLImageElement;
      if (img) {
        if (!img.complete) {
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }
        if (typeof img.decode === 'function') {
          try {
            await img.decode();
          } catch {
            // decode fallback
          }
        }
      }

      // Small pause to guarantee GPU / print rasterizer readiness
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 4. Trigger native browser print (works for both standard Chrome and Chrome --kiosk-printing)
      window.print();

      // Return needsConfirmation: true
      // window.print() opens print dialog or submits to printer driver without confirming physical paper output
      return {
        success: true,
        needsConfirmation: true,
        jobId: `win-${Date.now()}`,
      };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        success: false,
        errorMessage: 'Gagal membuka dialog cetak browser: ' + (error.message || String(error)),
        errorFix: 'Periksa driver iWare IW D260UL atau pastikan pop-up browser tidak diblokir.',
      };
    }
  }
}
