import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jsPDF from 'jspdf';

// Schema for export requests
const ExportRequestSchema = z.object({
  shareId: z.string().uuid(),
  format: z.enum(['pdf', 'excel', 'csv']),
  options: z.object({
    includeBreakdown: z.boolean().default(true),
    includeRecommendations: z.boolean().default(true),
    includeCharts: z.boolean().default(true),
    language: z.enum(['ja', 'en']).default('ja'),
    currency: z.string().default('JPY'),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shareId, format, options } = ExportRequestSchema.parse(body);

    // In a real implementation, fetch the comparison data from database
    // For now, we'll create a mock response structure
    const comparisonData = {
      id: shareId,
      title: '比較結果',
      description: 'マルチ数量価格比較',
      createdAt: new Date().toISOString(),
      baseParams: {
        bagTypeId: 'flat_3_side',
        materialId: 'pet_al',
        width: 200,
        height: 300,
        thicknessSelection: 'medium',
      },
      quantities: [500, 1000, 2000, 5000],
      calculations: new Map([
        [500, { unitPrice: 150, totalPrice: 75000, discountRate: 0 }],
        [1000, { unitPrice: 140, totalPrice: 140000, discountRate: 0.07 }],
        [2000, { unitPrice: 130, totalPrice: 260000, discountRate: 0.13 }],
        [5000, { unitPrice: 120, totalPrice: 600000, discountRate: 0.20 }],
      ]),
      comparison: {
        bestValue: {
          quantity: 5000,
          savings: 30000,
          percentage: 20,
          reason: '最大割引率適用',
        },
      },
    };

    let response: Response;

    switch (format) {
      case 'pdf':
        response = await generatePDF(comparisonData, options);
        break;
      case 'excel':
        response = await generateExcel(comparisonData, options);
        break;
      case 'csv':
        response = await generateCSV(comparisonData, options);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力値が正しくありません。',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    console.error('Export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'エクスポート中にエラーが発生しました。',
        },
      },
      { status: 500 }
    );
  }
}

async function generatePDF(data: any, options: any = {}): Promise<Response> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Header
  doc.setFontSize(20);
  doc.text(options.language === 'ja' ? '価格比較レポート' : 'Price Comparison Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Title and date
  doc.setFontSize(14);
  doc.text(data.title || options.language === 'ja' ? '価格比較結果' : 'Price Comparison Results', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.text(`${options.language === 'ja' ? '作成日時' : 'Created'}: ${new Date(data.createdAt).toLocaleString()}`, margin, yPosition);
  yPosition += 15;

  // Basic specifications
  doc.setFontSize(12);
  doc.text(options.language === 'ja' ? '基本仕様' : 'Basic Specifications', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.text(`${options.language === 'ja' ? '袋タイプ' : 'Bag Type'}: ${data.baseParams.bagTypeId}`, margin + 5, yPosition);
  yPosition += 6;
  doc.text(`${options.language === 'ja' ? '素材' : 'Material'}: ${data.baseParams.materialId}`, margin + 5, yPosition);
  yPosition += 6;
  doc.text(`${options.language === 'ja' ? 'サイズ' : 'Size'}: ${data.baseParams.width} × ${data.baseParams.height} mm`, margin + 5, yPosition);
  yPosition += 15;

  // Comparison table
  doc.setFontSize(12);
  doc.text(options.language === 'ja' ? '価格比較' : 'Price Comparison', margin, yPosition);
  yPosition += 8;

  // Table headers
  const headers = [
    options.language === 'ja' ? '数量' : 'Quantity',
    options.language === 'ja' ? '単価' : 'Unit Price',
    options.language === 'ja' ? '合計価格' : 'Total Price',
    options.language === 'ja' ? '割引率' : 'Discount',
  ];

  const columnWidths = [40, 50, 50, 40];
  let xPosition = margin;

  doc.setFontSize(10);
  headers.forEach((header, index) => {
    doc.text(header, xPosition, yPosition);
    xPosition += columnWidths[index];
  });
  yPosition += 8;

  // Table data
  data.quantities.forEach((quantity: number, index: number) => {
    const calc = data.calculations.get(quantity);
    xPosition = margin;

    const row = [
      quantity.toString(),
      `${calc.unitPrice} ${options.currency}`,
      `${calc.totalPrice.toLocaleString()} ${options.currency}`,
      `${(calc.discountRate * 100).toFixed(1)}%`,
    ];

    row.forEach((cell, cellIndex) => {
      doc.text(cell, xPosition, yPosition);
      xPosition += columnWidths[cellIndex];
    });
    yPosition += 6;
  });

  // Best value recommendation
  if (data.comparison?.bestValue) {
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(options.language === 'ja' ? '推奨事項' : 'Recommendations', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    const bestValue = data.comparison.bestValue;
    doc.text(
      `${options.language === 'ja' ? '最もお得な数量' : 'Best Value'}: ${bestValue.quantity}個`,
      margin + 5,
      yPosition
    );
    yPosition += 6;
    doc.text(
      `${options.language === 'ja' ? '節約額' : 'Savings'}: ${bestValue.savings.toLocaleString()} ${options.currency} (${bestValue.percentage}%)`,
      margin + 5,
      yPosition
    );
    yPosition += 6;
    doc.text(
      `${options.language === 'ja' ? '理由' : 'Reason'}: ${bestValue.reason}`,
      margin + 5,
      yPosition
    );
  }

  // Footer
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.text(
    options.language === 'ja' ? 'このレポートはEpackage Labによって生成されました。' : 'This report was generated by Epackage Lab.',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  const pdfBytes = doc.output('arraybuffer');

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="comparison-${data.id}.pdf"`,
      'Content-Length': pdfBytes.byteLength.toString(),
    },
  });
}

async function generateExcel(data: any, options: any = {}): Promise<Response> {
  // In a real implementation, use a library like 'xlsx' to generate Excel files
  // For now, create a simple CSV-based Excel-compatible format
  const headers = [
    options.language === 'ja' ? '数量' : 'Quantity',
    options.language === 'ja' ? '単価' : 'Unit Price',
    options.language === 'ja' ? '合計価格' : 'Total Price',
    options.language === 'ja' ? '割引率' : 'Discount',
  ];

  let csvContent = '\ufeff'; // BOM for UTF-8
  csvContent += headers.join(',') + '\n';

  data.quantities.forEach((quantity: number) => {
    const calc = data.calculations.get(quantity);
    const row = [
      quantity,
      calc.unitPrice,
      calc.totalPrice,
      `${(calc.discountRate * 100).toFixed(1)}%`,
    ];
    csvContent += row.join(',') + '\n';
  });

  // Add metadata
  csvContent += '\n';
  csvContent += `${options.language === 'ja' ? 'タイトル' : 'Title'},${data.title || options.language === 'ja' ? '価格比較結果' : 'Price Comparison Results'}\n`;
  csvContent += `${options.language === 'ja' ? '作成日時' : 'Created'},${new Date(data.createdAt).toLocaleString()}\n`;
  csvContent += `${options.language === 'ja' ? '袋タイプ' : 'Bag Type'},${data.baseParams.bagTypeId}\n`;
  csvContent += `${options.language === 'ja' ? '素材' : 'Material'},${data.baseParams.materialId}\n`;
  csvContent += `${options.language === 'ja' ? 'サイズ' : 'Size'},${data.baseParams.width} x ${data.baseParams.height} mm\n`;

  if (data.comparison?.bestValue) {
    csvContent += '\n';
    csvContent += `${options.language === 'ja' ? '最もお得な数量' : 'Best Value'},${data.comparison.bestValue.quantity}\n`;
    csvContent += `${options.language === 'ja' ? '節約額' : 'Savings'},${data.comparison.bestValue.savings} ${options.currency}\n`;
    csvContent += `${options.language === 'ja' ? '節約率' : 'Savings Percentage'},${data.comparison.bestValue.percentage}%\n`;
    csvContent += `${options.language === 'ja' ? '理由' : 'Reason'},${data.comparison.bestValue.reason}\n`;
  }

  const buffer = Buffer.from(csvContent, 'utf8');

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': `attachment; filename="comparison-${data.id}.csv"`,
      'Content-Length': buffer.length.toString(),
    },
  });
}

async function generateCSV(data: any, options: any = {}): Promise<Response> {
  const headers = [
    options.language === 'ja' ? '数量' : 'Quantity',
    options.language === 'ja' ? '単価' : 'Unit Price',
    options.language === 'ja' ? '合計価格' : 'Total Price',
    options.language === 'ja' ? '割引率' : 'Discount',
    options.language === 'ja' ? '単価削減率' : 'Unit Price Reduction',
    options.language === 'ja' ? '効率性' : 'Efficiency Rating',
  ];

  let csvContent = '\ufeff'; // BOM for UTF-8
  csvContent += headers.join(',') + '\n';

  // Calculate base unit price for comparison
  const baseUnitPrice = Math.min(...Array.from(data.calculations.values()).map((calc: any) => calc.unitPrice));

  data.quantities.forEach((quantity: number, index: number) => {
    const calc = data.calculations.get(quantity);
    const unitPriceReduction = ((baseUnitPrice - calc.unitPrice) / baseUnitPrice * 100).toFixed(1);
    const efficiency = calc.unitPrice <= baseUnitPrice * 1.1 ? '高' : calc.unitPrice <= baseUnitPrice * 1.2 ? '中' : '低';

    const row = [
      quantity,
      calc.unitPrice,
      calc.totalPrice,
      `${(calc.discountRate * 100).toFixed(1)}%`,
      `${unitPriceReduction}%`,
      efficiency,
    ];
    csvContent += row.join(',') + '\n';
  });

  // Add summary section
  csvContent += '\n';
  csvContent += `${options.language === 'ja' ? 'サマリー' : 'Summary'},\n`;
  csvContent += `${options.language === 'ja' ? 'タイトル' : 'Title'},${data.title || options.language === 'ja' ? '価格比較結果' : 'Price Comparison Results'}\n`;
  csvContent += `${options.language === 'ja' ? '作成日時' : 'Created'},${new Date(data.createdAt).toLocaleString()}\n`;
  csvContent += `${options.language === 'ja' ? '通貨' : 'Currency'},${options.currency}\n`;

  csvContent += '\n';
  csvContent += `${options.language === 'ja' ? '基本仕様' : 'Basic Specifications'},\n`;
  csvContent += `${options.language === 'ja' ? '袋タイプ' : 'Bag Type'},${data.baseParams.bagTypeId}\n`;
  csvContent += `${options.language === 'ja' ? '素材' : 'Material'},${data.baseParams.materialId}\n`;
  csvContent += `${options.language === 'ja' ? 'サイズ' : 'Size'},${data.baseParams.width} x ${data.baseParams.height} mm\n`;
  csvContent += `${options.language === 'ja' ? '厚さ' : 'Thickness'},${data.baseParams.thicknessSelection || '標準'}\n`;

  if (data.comparison?.bestValue) {
    csvContent += '\n';
    csvContent += `${options.language === 'ja' ? '最適提案' : 'Best Value Recommendation'},\n`;
    csvContent += `${options.language === 'ja' ? '推奨数量' : 'Recommended Quantity'},${data.comparison.bestValue.quantity}\n`;
    csvContent += `${options.language === 'ja' ? '想定節約額' : 'Estimated Savings'},${data.comparison.bestValue.savings} ${options.currency}\n`;
    csvContent += `${options.language === 'ja' ? '節約率' : 'Savings Rate'},${data.comparison.bestValue.percentage}%\n`;
    csvContent += `${options.language === 'ja' ? '推奨理由' : 'Recommendation Reason'},${data.comparison.bestValue.reason}\n`;
  }

  const buffer = Buffer.from(csvContent, 'utf8');

  return new Response(buffer, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="comparison-${data.id}.csv"`,
      'Content-Length': buffer.length.toString(),
    },
  });
}

// CORS configuration
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}