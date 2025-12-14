import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jsPDF from 'jspdf';

// 요청 스키마 정의
const PDFRequestSchema = z.object({
  quotationData: z.object({
    orderType: z.enum(['new', 'repeat']),
    contentsType: z.enum(['solid', 'liquid', 'powder']),
    bagType: z.enum(['flat_3_side', 'stand_up', 'gusset']),
    width: z.number(),
    height: z.number(),
    materialGenre: z.string(),
    surfaceMaterial: z.string(),
    materialComposition: z.string(),
    quantities: z.array(z.number()),
    deliveryDate: z.string().optional(),
  }),
  results: z.array(z.object({
    quantity: z.number(),
    unitPrice: z.number(),
    totalPrice: z.number(),
    discountFactor: z.number().optional(),
  })),
  comparison: z.object({
    bestQuantity: z.number(),
    bestUnitPrice: z.number(),
    economyRate: z.number(),
    recommendations: z.array(z.string()),
  }),
  customerInfo: z.object({
    companyName: z.string().optional(),
    contactName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

// 캐싱 설정
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// 일본어 라벨 매핑
const japaneseLabels = {
  orderType: {
    new: '新規注文',
    repeat: 'リピート注文',
  },
  contentsType: {
    solid: '固体',
    liquid: '液体',
    powder: '粉末',
  },
  bagType: {
    flat_3_side: '平袋（三方シール）',
    stand_up: 'スタンド袋',
    gusset: 'ガゼット袋',
  },
};

// PDF 생성 함수
async function generateQuotationPDF(data: z.infer<typeof PDFRequestSchema>): Promise<Uint8Array> {
  const { quotationData, results, comparison, customerInfo } = data;

  // PDF 초기 설정 (A4)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 일본어 폰트 설정 (기본 폰트 사용)
  pdf.setFont('helvetica');

  let yPosition = 20;
  const lineHeight = 7;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pdf.internal.pageSize.width - (margin * 2);

  // 헤더
  pdf.setFontSize(20);
  pdf.text('お見積書', margin, yPosition);
  yPosition += 15;

  pdf.setFontSize(10);
  pdf.text(`発行日: ${new Date().toLocaleDateString('ja-JP')}`, margin, yPosition);
  yPosition += 10;

  // 고객 정보
  if (customerInfo) {
    pdf.setFontSize(12);
    pdf.text('お客様情報', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    if (customerInfo.companyName) {
      pdf.text(`${customerInfo.companyName} 御中`, margin, yPosition);
      yPosition += lineHeight;
    }
    if (customerInfo.contactName) {
      pdf.text(`ご担当者: ${customerInfo.contactName}`, margin, yPosition);
      yPosition += lineHeight;
    }
    if (customerInfo.email) {
      pdf.text(`メール: ${customerInfo.email}`, margin, yPosition);
      yPosition += lineHeight;
    }
    if (customerInfo.phone) {
      pdf.text(`電話: ${customerInfo.phone}`, margin, yPosition);
      yPosition += lineHeight;
    }
    yPosition += 5;
  }

  // 見積もり番号
  const quotationNumber = `Q${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`;
  pdf.text(`見積番号: ${quotationNumber}`, margin, yPosition);
  yPosition += 15;

  // 仕様詳細
  pdf.setFontSize(12);
  pdf.text('仕様詳細', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  const specifications = [
    ['注文種別', japaneseLabels.orderType[quotationData.orderType]],
    ['内容物', japaneseLabels.contentsType[quotationData.contentsType]],
    ['袋タイプ', japaneseLabels.bagType[quotationData.bagType]],
    ['サイズ', `${quotationData.width}mm × ${quotationData.height}mm`],
    ['素材ジャンル', quotationData.materialGenre],
    ['表面素材', quotationData.surfaceMaterial],
    ['素材構成', quotationData.materialComposition],
  ];

  specifications.forEach(([label, value]) => {
    pdf.text(`${label}: ${value}`, margin, yPosition);
    yPosition += lineHeight;
  });

  if (quotationData.deliveryDate) {
    pdf.text(`納期希望: ${new Date(quotationData.deliveryDate).toLocaleDateString('ja-JP')}`, margin, yPosition);
    yPosition += lineHeight;
  }

  yPosition += 10;

  // 価格表
  pdf.setFontSize(12);
  pdf.text('価格表', margin, yPosition);
  yPosition += 10;

  // 표 헤더
  const tableHeaders = ['数量', '単価(円)', '合計価格(円)'];
  const columnWidths = [40, 60, 60];

  pdf.setFontSize(10);
  let xPos = margin;
  tableHeaders.forEach((header, index) => {
    pdf.text(header, xPos, yPosition);
    xPos += columnWidths[index];
  });
  yPosition += 5;

  // 구분선
  pdf.line(margin, yPosition, margin + contentWidth, yPosition);
  yPosition += 5;

  // 표 데이터
  results.forEach((result) => {
    xPos = margin;
    const row = [
      `${result.quantity.toLocaleString()}個`,
      `${Math.round(result.unitPrice).toLocaleString()}円`,
      `${Math.round(result.totalPrice).toLocaleString()}円`,
    ];

    row.forEach((cell, index) => {
      pdf.text(cell, xPos, yPosition);
      xPos += columnWidths[index];
    });
    yPosition += lineHeight;
  });

  yPosition += 10;

  // おすすめ情報
  pdf.setFontSize(12);
  pdf.text('おすすめ情報', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.text(`最もお得な数量: ${comparison.bestQuantity.toLocaleString()}個`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`最大節約率: ${comparison.economyRate.toFixed(1)}%`, margin, yPosition);
  yPosition += lineHeight;

  if (comparison.recommendations.length > 0) {
    yPosition += 5;
    pdf.text('おすすめポイント:', margin, yPosition);
    yPosition += lineHeight;
    comparison.recommendations.forEach((recommendation) => {
      pdf.text(`• ${recommendation}`, margin + 5, yPosition);
      yPosition += lineHeight;
    });
  }

  yPosition += 15;

  // 備考
  pdf.setFontSize(12);
  pdf.text('備考', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  const notes = [
    '本見積もりには消費税が含まれておりません。',
    '注文個数や仕様によって価格が変更される場合がございます。',
    '納期は仕様確認後、改めてご連絡いたします。',
    'リピート注文には5%割引が適用されます。',
  ];

  notes.forEach((note) => {
    pdf.text(`• ${note}`, margin, yPosition);
    yPosition += lineHeight;
  });

  yPosition += 15;

  // 会社情報（フッター）
  pdf.setFontSize(10);
  pdf.text('株式会社Epackage Lab', margin, pageHeight - 30);
  pdf.text('〒123-4567 東京都品川区...', margin, pageHeight - 25);
  pdf.text('TEL: 03-1234-5678 | Email: info@epackage-lab.jp', margin, pageHeight - 20);
  pdf.text('Web: https://epackage-lab.jp', margin, pageHeight - 15);

  return new Uint8Array(pdf.output('arraybuffer'));
}

// 성능 모니터링 미들웨어
function withPerformanceMonitoring<T extends (req: NextRequest) => Promise<NextResponse>>(
  fn: T
): T {
  return (async (_req: NextRequest) => {
    const startTime = performance.now();
    const requestId = crypto.randomUUID();

    try {
      const response = await fn(_req);
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Processing-Time', processingTime.toString());

      if (processingTime > 1000) {
        console.warn(`⚠️ Slow PDF generation: ${processingTime}ms for ${requestId}`);
      }

      return response;
    } catch (error) {
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      console.error(`❌ PDF Generation Error: ${requestId}, Time: ${processingTime}ms`, error);
      throw error;
    }
  }) as T;
}

// API 핸들러
const handler = async (req: NextRequest) => {
  if (req.method !== 'POST') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'POST メソッドのみ許可されます。',
        },
      },
      { status: 405 }
    );
  }

  try {
    const body = await req.json();
    const requestId = crypto.randomUUID();

    // 요청 데이터 검증
    const validatedData = PDFRequestSchema.parse(body);

    // PDF 생성
    const pdfBuffer = await generateQuotationPDF(validatedData);

    // PDF 응답 반환 - Uint8Array를 ReadableStream으로 변환
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(pdfBuffer);
        controller.close();
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation_${new Date().toISOString().split('T')[0]}.pdf"`,
        'X-Request-ID': requestId,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {

    // Zod 검증 에러 처리
    if (error instanceof z.ZodError) {
      const details: Record<string, string[]> = {};
      error.errors.forEach(err => {
        const field = err.path.join('.');
        if (!details[field]) {
          details[field] = [];
        }
        details[field].push(err.message);
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'PDF生成に必要なデータが不足しています。',
            details,
          },
        },
        { status: 400 }
      );
    }

    // 일반 에러 처리
    console.error('PDF Generation Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'PDF生成中にエラーが発生しました。',
        },
      },
      { status: 500 }
    );
  }
};

// 성능 모니터링과 함께 핸들러 내보내기
export const POST = withPerformanceMonitoring(handler);

// CORS 설정
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