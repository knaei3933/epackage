/**
 * Client PDF Adapter
 *
 * クライアントPDFアダプター
 * - ブラウザ側でのPDF生成をサポート
 * - jsPDF/html2canvas統合
 * - サーバーレスPDF生成
 */

import type { PdfGenerationResult } from '@/types/contract';

// ============================================================
// Types
// ============================================================

/**
 * クライアントPDFオプション
 */
export interface ClientPdfOptions {
  /** HTML要素セレクターまたは要素 */
  element: string | HTMLElement;
  /** ファイル名 */
  filename?: string;
  /** 画像品質（0-1） */
  scale?: number;
  /** DPI */
  dpi?: number;
  /** コールバック */
  onProgress?: (progress: number) => void;
}

/**
 * PDF生成結果（クライアント）
 */
export interface ClientPdfResult {
  /** 成功フラグ */
  success: boolean;
  /** PDFデータURL */
  dataUrl?: string;
  /** PDF Blob */
  blob?: Blob;
  /** エラーメッセージ */
  error?: string;
}

// ============================================================
// Client PDF Adapter Class
// ============================================================

/**
 * クライアントPDFアダプター
 * Client PDF adapter for browser-side PDF generation
 */
export class ClientPdfAdapter {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  /**
   * HTML要素からPDFを生成
   * Generate PDF from HTML element
   */
  static async generateFromHtml(options: ClientPdfOptions): Promise<ClientPdfResult> {
    if (!this.isBrowser()) {
      return {
        success: false,
        error: 'ClientPdfAdapter can only be used in browser environment',
      };
    }

    try {
      const element = typeof options.element === 'string'
        ? document.querySelector(options.element) as HTMLElement
        : options.element;

      if (!element) {
        return {
          success: false,
          error: 'Element not found',
        };
      }

      // html2canvasでキャプチャ
      const canvas = await this.captureElement(element, options.scale || 2);

      // PDF生成（簡易版）
      const pdfData = this.canvasToPdfData(canvas);

      return {
        success: true,
        dataUrl: pdfData,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * HTML要素をキャプチャ
   * Capture HTML element to canvas
   */
  private static async captureElement(
    element: HTMLElement,
    scale: number = 2
  ): Promise<HTMLCanvasElement> {
    // html2canvasが利用可能かチェック
    const html2canvas = (window as any).html2canvas;
    if (!html2canvas) {
      throw new Error('html2canvas library not loaded');
    }

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
    });

    return canvas;
  }

  /**
   * CanvasをPDFデータに変換
   * Convert canvas to PDF data
   */
  private static canvasToPdfData(canvas: HTMLCanvasElement): string {
    // jsPDFが利用可能かチェック
    const jsPDF = (window as any).jspdf;
    if (!jsPDF) {
      // フォールバック: 画像として返す
      return canvas.toDataURL('image/png');
    }

    const { jsPDF: JsPDF } = jsPDF;
    const pdf = new JsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

    return pdf.output('datauristring');
  }

  /**
   * 複数ページのPDFを生成
   * Generate multi-page PDF
   */
  static async generateMultiPage(
    elements: (string | HTMLElement)[],
    filename: string = 'document.pdf'
  ): Promise<ClientPdfResult> {
    if (!this.isBrowser()) {
      return {
        success: false,
        error: 'ClientPdfAdapter can only be used in browser environment',
      };
    }

    try {
      const jsPDF = (window as any).jspdf;
      if (!jsPDF) {
        return {
          success: false,
          error: 'jsPDF library not loaded',
        };
      }

      const { jsPDF: JsPDF } = jsPDF;
      const pdf = new JsPDF();

      for (let i = 0; i < elements.length; i++) {
        const element = typeof elements[i] === 'string'
          ? document.querySelector(elements[i]) as HTMLElement
          : elements[i];

        if (!element) {
          continue;
        }

        // キャプチャ
        const result = await this.generateFromHtml({ element });
        if (!result.success || !result.dataUrl) {
          continue;
        }

        // ページを追加（最初のページは既に存在）
        if (i > 0) {
          pdf.addPage();
        }

        // 画像を追加（簡易版）
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(result.dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      const dataUrl = pdf.output('datauristring');

      return {
        success: true,
        dataUrl,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * PDFをダウンロード
   * Download PDF
   */
  static downloadPdf(dataUrl: string, filename: string = 'document.pdf'): void {
    if (!this.isBrowser()) {
      return;
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }

  /**
   * 必要なライブラリがロードされているかチェック
   * Check if required libraries are loaded
   */
  static checkLibraries(): { html2canvas: boolean; jsPDF: boolean } {
    if (!this.isBrowser()) {
      return { html2canvas: false, jsPDF: false };
    }

    return {
      html2canvas: typeof (window as any).html2canvas === 'function',
      jsPDF: typeof (window as any).jspdf !== 'undefined',
    };
  }
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * サーバーサイド生成用のスタブ関数
 * Stub function for server-side
 */
export function generateClientPdfStub(): PdfGenerationResult {
  return {
    success: false,
    error: 'Client-side PDF generation is only available in browser environment. Use server-side generators instead.',
  };
}
