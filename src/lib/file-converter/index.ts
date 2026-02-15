/**
 * File Conversion Service
 *
 * ファイル変換サービス - .ai、PDF、PSDファイルをPNGに変換
 * - Adobe Illustrator (.ai) → PDF → PNG
 * - PDF → PNG
 * - PSD → PNG
 */

import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

// ============================================================
// Types
// ============================================================

export interface ConversionOptions {
  quality?: number; // 1-100
  scale?: number; // Scale factor for output
  page?: number; // Page number for multi-page documents
}

export interface ConversionResult {
  success: boolean;
  data?: string; // Base64 encoded image
  format?: string;
  error?: string;
  metadata?: {
    width: number;
    height: number;
    pages?: number;
  };
}

export type SupportedFileType = 'ai' | 'pdf' | 'psd' | 'png' | 'jpg';

// ============================================================
// File Converter Class
// ============================================================

export class FileConverter {
  private options: ConversionOptions;

  constructor(options: ConversionOptions = {}) {
    this.options = {
      quality: 90,
      scale: 2, // Higher scale for better quality
      page: 0,
      ...options,
    };
  }

  /**
   * Convert file to PNG (base64 encoded)
   */
  async convertToPNG(
    file: File | Buffer,
    fileType: SupportedFileType
  ): Promise<ConversionResult> {
    try {
      let buffer: Buffer;

      // Convert File to Buffer if needed
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        buffer = file;
      }

      switch (fileType) {
        case 'ai':
          return await this.convertAIToPNG(buffer);
        case 'pdf':
          return await this.convertPDFToPNG(buffer);
        case 'psd':
          return await this.convertPSDToPNG(buffer);
        case 'png':
        case 'jpg':
          // Already an image, just convert to PNG if needed
          return await this.convertImageToPNG(buffer);
        default:
          return {
            success: false,
            error: `Unsupported file type: ${fileType}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Convert Adobe Illustrator file to PNG
   * AI files are essentially PDF with embedded data
   */
  private async convertAIToPDF(buffer: Buffer): Promise<Buffer> {
    // AI files have a PDF header that starts with "%PDF"
    // We need to extract or wrap the AI content

    // For now, assume the AI file can be treated as PDF
    // In production, you might use Adobe Illustrator API or a dedicated converter

    // Check if it's already a PDF
    const header = buffer.toString('ascii', 0, 4);
    if (header === '%PDF') {
      return buffer; // Already a PDF
    }

    // Otherwise, this would require a proper AI conversion service
    throw new Error(
      'AI file requires conversion service. Consider using Adobe APIs or server-side Illustrator.'
    );
  }

  /**
   * Convert AI to PNG via PDF
   */
  private async convertAIToPNG(buffer: Buffer): Promise<ConversionResult> {
    try {
      // First convert AI to PDF
      const pdfBuffer = await this.convertAIToPDF(buffer);

      // Then convert PDF to PNG
      return await this.convertPDFToPNG(pdfBuffer);
    } catch (error) {
      return {
        success: false,
        error: `AI conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Convert PDF to PNG
   */
  private async convertPDFToPNG(buffer: Buffer): Promise<ConversionResult> {
    try {
      // Load PDF document
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      if (pages.length === 0) {
        return {
          success: false,
          error: 'PDF has no pages',
        };
      }

      // Get the requested page (or first page)
      const pageIndex = Math.min(this.options.page || 0, pages.length - 1);
      const page = pages[pageIndex];

      const { width, height } = page.getSize();

      // Convert PDF page to image
      // Note: pdf-lib doesn't directly support rendering to image
      // In production, you would use:
      // - pdf2pic (Node.js)
      // - pdf-poppler (Node.js)
      // - A server-side solution with ImageMagick or Ghostscript

      // For now, return metadata and indicate that actual rendering needs a different service
      return {
        success: false,
        error: 'PDF rendering requires server-side conversion service (pdf2pic, Ghostscript, or similar)',
        metadata: {
          width: Math.round(width),
          height: Math.round(height),
          pages: pages.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `PDF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Convert PSD to PNG
   */
  private async convertPSDToPNG(buffer: Buffer): Promise<ConversionResult> {
    try {
      // PSD files require specialized libraries like:
      // - ag-psd (JavaScript PSD parser)
      // - psd (Node.js library)
      // - Adobe Photoshop APIs

      // For now, indicate that PSD conversion requires a dedicated service
      return {
        success: false,
        error: 'PSD conversion requires specialized library (ag-psd or similar)',
      };
    } catch (error) {
      return {
        success: false,
        error: `PSD conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Convert image to PNG
   */
  private async convertImageToPNG(buffer: Buffer): Promise<ConversionResult> {
    try {
      // Use sharp to convert to PNG
      const result = await sharp(buffer)
        .png({
          quality: this.options.quality,
        })
        .toBuffer();

      const metadata = await sharp(result).metadata();

      return {
        success: true,
        data: `data:image/png;base64,${result.toString('base64')}`,
        format: 'png',
        metadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Image conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Convert base64 to PNG buffer
   */
  static async base64ToBuffer(base64: string): Promise<Buffer> {
    const data = base64.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(data, 'base64');
  }

  /**
   * Detect file type from buffer
   */
  static detectFileType(buffer: Buffer): SupportedFileType | null {
    const header = buffer.slice(0, 12).toString('ascii');

    // PDF: %PDF-
    if (header.startsWith('%PDF-')) {
      return 'pdf';
    }

    // PNG: \x89PNG
    if (header[0] === '\x89' && header.slice(1, 4) === 'PNG') {
      return 'png';
    }

    // JPG: \xff\xd8\xff
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'jpg';
    }

    // PSD: 8BPS
    if (header.slice(0, 4) === '8BPS') {
      return 'psd';
    }

    // AI files are more complex - they have embedded PDF
    // Check for PDF header
    if (header.startsWith('%PDF-')) {
      return 'ai';
    }

    return null;
  }
}

// ============================================================
// Convenience Functions
// ============================================================

/**
 * Quick conversion function
 */
export async function convertFileToPNG(
  file: File | Buffer,
  fileType?: SupportedFileType,
  options?: ConversionOptions
): Promise<ConversionResult> {
  const converter = new FileConverter(options);

  // Auto-detect file type if not provided
  const detectedType =
    fileType ||
    (file instanceof Buffer
      ? FileConverter.detectFileType(file)
      : null);

  if (!detectedType) {
    return {
      success: false,
      error: 'Could not detect file type',
    };
  }

  return converter.convertToPNG(file, detectedType);
}

/**
 * Convert multiple files to PNG in parallel
 */
export async function convertFilesToPNG(
  files: Array<{ file: File | Buffer; type?: SupportedFileType }>,
  options?: ConversionOptions
): Promise<ConversionResult[]> {
  const converter = new FileConverter(options);

  return Promise.all(
    files.map(({ file, type }) => {
      const detectedType = type || (file instanceof Buffer ? FileConverter.detectFileType(file) : null);
      if (!detectedType) {
        return Promise.resolve({
          success: false,
          error: 'Could not detect file type',
        });
      }
      return converter.convertToPNG(file, detectedType);
    })
  );
}

// ============================================================
// Export default
// ============================================================

export default FileConverter;
