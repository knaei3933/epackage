/**
 * Quote PDF Generator
 *
 * Generates single-quantity quote PDFs.
 */

import html2canvas from "html2canvas";
import { jsPDF } from 'jspdf';
import type { QuoteData, PdfGenerationOptions, PdfGenerationResult } from './types';
import { JAPANESE_CONSTANTS } from './constants';
import { formatJapaneseDate, formatYen, calculateTotals } from './format-helpers';
import { sanitizePdfHtml } from './sanitize';
import { validatePdfData } from './validation';
import { generateQuoteHTML } from './quote-html';
import { generateProductTypeSection } from './product-type-section';

/**
 * Generate Quote PDF (Excel Template Format with CJK support)
 *
 * Excelテンプレート形式で見積書PDFを生成（CJK対応）
 *
 * @param data - Quote data
 * @param options - PDF generation options
 * @returns PDF generation result with base64 or buffer
 */
export async function generateQuotePDF(
  data: QuoteData,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  try {
    console.log('[PDF Generator] Received data:', {
      quoteNumber: data.quoteNumber,
      specifications: data.specifications,
      optionalProcessing: data.optionalProcessing
    });

    // Validate data
    const validation = validatePdfData(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        errorEn: validation.errors.join(', '),
      };
    }

    // Calculate totals
    const { subtotal, tax, total } = calculateTotals(data.items);

    // Create HTML template for quote
    const html = generateQuoteHTML(data, { subtotal, tax, total });

    // Create a temporary DOM element for rendering
    if (typeof window === 'undefined') {
      // Server-side: Return error (requires browser environment)
      return {
        success: false,
        error: '見積PDF生成はブラウザ環境でサポートされている機能です',
        errorEn: 'Quote PDF generation is only supported in browser environment',
      };
    }

    // ============================================================
    // FREEZE PAGE LAYOUT - Ultimate approach to eliminate any reflow
    // ============================================================
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    // Store current scroll position
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Store original styles
    const originalStyles = {
      htmlOverflow: htmlElement.style.overflow,
      htmlPosition: htmlElement.style.position,
      htmlWidth: htmlElement.style.width,
      htmlTop: htmlElement.style.top,
      htmlTransform: htmlElement.style.transform,
      bodyOverflow: bodyElement.style.overflow,
      bodyPosition: bodyElement.style.position,
      bodyWidth: bodyElement.style.width,
      bodyMinWidth: bodyElement.style.minWidth,
      bodyTransform: bodyElement.style.transform,
    };

    // Store current dimensions before freezing
    const currentBodyWidth = bodyElement.offsetWidth;

    // Apply comprehensive freeze to both HTML and Body elements
    // This prevents ANY reflow during PDF generation by fixing layout completely
    htmlElement.style.overflow = 'hidden';
    htmlElement.style.position = 'fixed';
    htmlElement.style.width = '100vw';
    htmlElement.style.top = `-${scrollY}px`;
    htmlElement.style.transform = 'scale(1)'; // Force GPU compositing

    bodyElement.style.overflow = 'hidden';
    bodyElement.style.position = 'fixed';
    bodyElement.style.width = '100vw';
    bodyElement.style.minWidth = Math.max(currentBodyWidth, window.innerWidth) + 'px';
    bodyElement.style.transform = 'translateZ(0)'; // Force GPU compositing

    try {
      // Wait for browser to apply freeze styles
      await new Promise(resolve => requestAnimationFrame(resolve));
      // Double wait to ensure browser is completely stable
      await new Promise(resolve => setTimeout(resolve, 50));

      // ============================================================
      // HIDDEN CONTAINER APPROACH - Direct DOM rendering
      // ============================================================
      // This avoids iframe/CORS issues by rendering HTML directly in a
      // hidden container within the main document. html2canvas can then
      // capture it without cross-origin restrictions.
      //
      // Advantages over iframe approach:
      // - No CORS/iframe access issues
      // - Proper UTF-8 Japanese character support
      // - Same-origin access for html2canvas
      // - Works with strict CSP headers (X-Frame-Options: DENY)

      // Create hidden container for HTML rendering
      // IMPORTANT: html2canvas requires the element to be VISIBLE (not visibility: hidden)
      // We position it far off-screen instead
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-99999px';
      container.style.top = '-99999px';
      container.style.width = '210mm';
      container.style.minHeight = '297mm'; // A4 height
      container.style.zIndex = '-999999';
      // DON'T use visibility: hidden - html2canvas won't capture it
      // DON'T use display: none - html2canvas won't capture it
      // Use position off-screen instead
      container.style.background = '#ffffff';
      container.style.padding = '0';
      container.style.margin = '0';

      // Sanitize HTML before innerHTML to prevent stored XSS (ADV-E2E-006)
      container.innerHTML = sanitizePdfHtml(html);

      // Append to DOM for rendering
      document.body.appendChild(container);

      // Wait for rendering and font loading
      console.log('[PDF Generator] Waiting for container to render...');
      console.log('[PDF Generator] Container dimensions:', {
        scrollWidth: container.scrollWidth,
        scrollHeight: container.scrollHeight,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
      });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert to canvas with proper error handling
      let canvas: HTMLCanvasElement;
      try {
        console.log('[PDF Generator] Starting html2canvas capture...');
        canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: true, // Enable logging for debugging
          backgroundColor: '#ffffff',
          allowTaint: true,
          // Don't use windowHeight/windowWidth - let html2canvas detect naturally
          onclone: (clonedDoc) => {
            console.log('[PDF Generator] html2canvas onclone called');
            const clonedContainer = clonedDoc.querySelector('div[style*="-99999px"]');
            if (clonedContainer) {
              console.log('[PDF Generator] Cloned container found:', {
                scrollWidth: clonedContainer.scrollWidth,
                scrollHeight: clonedContainer.scrollHeight,
              });
            }
          },
        });

        // Debug: Check canvas dimensions
        console.log('[PDF Generator] Canvas captured successfully:', {
          width: canvas.width,
          height: canvas.height,
          dataSize: canvas.toDataURL().length,
        });

        // Validate canvas has content
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('Canvas has zero dimensions - capture failed');
        }
      } catch (canvasError) {
        // Ensure cleanup even on canvas error
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        throw new Error(`html2canvas failed: ${canvasError instanceof Error ? canvasError.message : String(canvasError)}`);
      }

      // Clean up: remove container ONLY after successful capture
      if (document.body.contains(container)) {
        console.log('[PDF Generator] Cleaning up container...');
        document.body.removeChild(container);
      }

      // Create PDF from canvas
      const imgData = canvas.toDataURL('image/png', 0.95);

      // A4 dimensions in mm (210 x 297)
      const a4Width = 210;
      const a4Height = 297;

      // Margins (reduced)
      const marginTop = 10;
      const marginBottom = 10;
      const marginLeft = 15;
      const marginRight = 15;

      // Available content area
      const contentWidth = a4Width - marginLeft - marginRight; // 180mm
      const contentHeight = a4Height - marginTop - marginBottom; // 277mm

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Calculate aspect ratio
      const canvasAspectRatio = canvas.width / canvas.height;
      const contentAspectRatio = contentWidth / contentHeight;

      let finalWidth, finalHeight, xOffset, yOffset;

      // Fit canvas to content area while maintaining aspect ratio
      if (canvasAspectRatio > contentAspectRatio) {
        // Canvas is wider - fit to width
        finalWidth = contentWidth;
        finalHeight = contentWidth / canvasAspectRatio;
        xOffset = marginLeft;
        yOffset = marginTop + (contentHeight - finalHeight) / 2; // Center vertically in content area
      } else {
        // Canvas is taller - fit to height
        finalHeight = contentHeight;
        finalWidth = contentHeight * canvasAspectRatio;
        xOffset = marginLeft + (contentWidth - finalWidth) / 2; // Center horizontally in content area
        yOffset = marginTop;
      }

      console.log('[PDF Generator] PDF dimensions:', {
        canvasSize: { width: canvas.width, height: canvas.height },
        a4Size: { width: a4Width, height: a4Height },
        margins: { top: marginTop, bottom: marginBottom, left: marginLeft, right: marginRight },
        contentArea: { width: contentWidth, height: contentHeight },
        finalSize: { width: finalWidth, height: finalHeight },
        offset: { x: xOffset, y: yOffset },
      });

      doc.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

      // Determine filename
      const filename = options.filename || `${data.quoteNumber}.pdf`;

      // For compatibility, also generate buffer for return value
      let pdfUint8Array: Uint8Array;
      try {
        pdfUint8Array = new Uint8Array(doc.output('arraybuffer'));
      } catch (e) {
        console.warn('[PDF Generator] Could not generate buffer for return value:', e);
        pdfUint8Array = new Uint8Array(0);
      }

      // Return based on options
      if (options.returnBase64) {
        // Convert Uint8Array to base64 (browser-compatible)
        const binaryString = Array.from(pdfUint8Array, byte => String.fromCharCode(byte)).join('');
        const base64 = btoa(binaryString);
        return {
          success: true,
          base64,
          filename,
          size: pdfUint8Array.length,
        };
      }

      return {
        success: true,
        pdfBuffer: pdfUint8Array, // Return Uint8Array instead of Buffer
        filename,
        size: pdfUint8Array.length,
      };
    } finally {
      // CRITICAL: Ensure container cleanup even if error occurs
      const containers = document.querySelectorAll('div[style*="z-index: -999999"]');
      containers.forEach(container => {
        if (document.body.contains(container)) {
          try {
            document.body.removeChild(container);
            console.log('[PDF Generator] Cleaned up container in finally block');
          } catch (cleanupError) {
            console.warn('[PDF Generator] Failed to cleanup container:', cleanupError);
          }
        }
      });

      // Restore HTML element styles
      htmlElement.style.overflow = originalStyles.htmlOverflow;
      htmlElement.style.position = originalStyles.htmlPosition;
      htmlElement.style.width = originalStyles.htmlWidth;
      htmlElement.style.top = originalStyles.htmlTop;
      htmlElement.style.transform = originalStyles.htmlTransform;

      // Restore body styles
      bodyElement.style.overflow = originalStyles.bodyOverflow;
      bodyElement.style.position = originalStyles.bodyPosition;
      bodyElement.style.width = originalStyles.bodyWidth;
      bodyElement.style.minWidth = originalStyles.bodyMinWidth;
      bodyElement.style.transform = originalStyles.bodyTransform;

      // Restore scroll position
      window.scrollTo(scrollX, scrollY);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PDF生成に失敗しました',
      errorEn: error instanceof Error ? error.message : 'PDF generation failed',
    };
  }
}

