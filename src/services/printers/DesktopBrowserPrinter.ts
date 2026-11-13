import {
  AdminSettings,
  PrinterAdapter,
  PrintJobParams,
  PrintResult,
} from '../../types';

export class DesktopBrowserPrinter implements PrinterAdapter {
  readonly id = 'desktop-usb';
  readonly name = 'Desktop USB (Browser Print)';

  async checkHealth(_settings: AdminSettings): Promise<{
    ready: boolean;
    info?: string;
    error?: string;
  }> {
    if (typeof window === 'undefined' || typeof window.print !== 'function') {
      return {
        ready: false,
        error: 'Pencetakan browser (window.print) tidak didukung pada lingkungan ini.',
      };
    }

    return {
      ready: true,
      info: 'Browser Print siap digunakan untuk printer USB (iWare / 80mm ESC/POS).',
    };
  }

  async print(params: PrintJobParams): Promise<PrintResult> {
    const { previewUrl, settings } = params;

    if (settings.mockPrinter) {
      console.warn('Mode simulasi Desktop USB aktif.');
      await new Promise((res) => setTimeout(res, 1500));
      return {
        success: true,
        needsConfirmation: true,
        jobId: `mock-desktop-${Date.now()}`,
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
      // 1. Prepare / update the dedicated print DOM container
      let printContainer = document.getElementById('photobox-print-target');
      if (!printContainer) {
        printContainer = document.createElement('div');
        printContainer.id = 'photobox-print-target';
        document.body.appendChild(printContainer);
      }

      // Populate print container with receipt image
      printContainer.innerHTML = `
        <div class="photobox-receipt-wrapper">
          <img src="${previewUrl}" alt="Photobox Print" id="photobox-print-image" />
        </div>
      `;

      // 2. Inject or update dynamic @media print styles
      const paperWidthMm = settings.desktopPaperWidthMm || 80;
      const marginMm = settings.desktopMarginMm || 0;

      let styleEl = document.getElementById('photobox-print-dynamic-styles') as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'photobox-print-dynamic-styles';
        document.head.appendChild(styleEl);
      }

      styleEl.textContent = `
        @media print {
          @page {
            size: ${paperWidthMm}mm auto;
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
          /* Hide all application UI during print */
          #root {
            display: none !important;
          }
          /* Display only the dedicated receipt container */
          #photobox-print-target {
            display: block !important;
            width: ${paperWidthMm}mm !important;
            margin: 0 auto !important;
            padding: ${marginMm}mm !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          .photobox-receipt-wrapper {
            width: 100% !important;
            margin: 0 auto !important;
            text-align: center !important;
          }
          #photobox-print-image {
            width: 100% !important;
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

      // Wait a tick for DOM and image decode
      const img = printContainer.querySelector('#photobox-print-image') as HTMLImageElement;
      if (img && !img.complete) {
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }

      // Small pause to ensure rendering engine is ready for print
      await new Promise((resolve) => setTimeout(resolve, 150));

      // 3. Trigger native browser print
      window.print();

      // Return with needsConfirmation: true
      // Because window.print() returns immediately after dialog is dismissed (either Print or Cancel was clicked)
      return {
        success: true,
        needsConfirmation: true,
        jobId: `desktop-${Date.now()}`,
      };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        success: false,
        errorMessage: 'Gagal membuka dialog cetak browser: ' + (error.message || String(error)),
        errorFix: 'Periksa pengaturan pop-up browser atau hubungkan printer USB.',
      };
    }
  }
}
