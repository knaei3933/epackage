import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { priceCalculator } from '@/lib/pricing';
import { memoryCache, generateQuotationCacheKey, retry } from '@/lib/cache';

// 요청 스키마 정의
const QuotationRequestSchema = z.object({
  orderType: z.enum(['new', 'repeat']),
  contentsType: z.enum(['solid', 'liquid', 'powder']),
  bagType: z.enum(['flat_3_side', 'stand_up', 'gusset']),
  width: z.number().min(10).max(1000),
  height: z.number().min(10).max(1000),
  materialGenre: z.string().min(1),
  surfaceMaterial: z.string().min(1),
  materialComposition: z.string().min(1),
  quantities: z.array(z.number().min(100)).max(5),
  deliveryDate: z.string().datetime().optional(),
});

import { QuotationResult } from '@/types/simulation';

// 응답 데이터 타입 정의
interface CalculationResults {
  results: QuotationResult[];
  comparison: {
    bestQuantity: number;
    bestUnitPrice: number;
    economyRate: number;
    recommendations: string[];
  };
  calculation: {
    basePrice: number;
    materialMultiplier: number;
    sizeMultiplier: number;
    quantityDiscount: number;
    calculatedAt: string;
  };
  processingTime: number;
  fromCache: boolean;
}

// 응답 타입 정의
interface QuotationResponse {
  success: boolean;
  data?: CalculationResults;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  metadata: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    fromCache?: boolean;
  };
}

// 캐싱 설정 (Next.js 15 App Router)
export const revalidate = 0; // 실시간 계산이므로 캐싱 안 함
export const dynamic = 'force-dynamic';

// 성능 모니터링 미들웨어
function withPerformanceMonitoring<T extends (req: NextRequest) => Promise<NextResponse>>(
  fn: T
): T {
  return (async (_req: NextRequest) => {
    const startTime = performance.now();
    const requestId = crypto.randomUUID();

    try {
      // 응답 헤더에 요청 ID 추가
      const response = await fn(_req);
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Processing-Time', processingTime.toString());

      // 성능 로깅
      if (processingTime > 200) {
        console.warn(`⚠️ Slow API response: ${processingTime}ms for ${requestId}`);
      }

      return response;
    } catch (error) {
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      console.error(`❌ API Error: ${requestId}, Time: ${processingTime}ms`, error);
      throw error;
    }
  }) as T;
}

// 메인 계산 로직
async function calculateQuotation(request: z.infer<typeof QuotationRequestSchema>) {
  const startTime = performance.now();

  try {
    // 캐시 키 생성
    const cacheKey = generateQuotationCacheKey(request);

    // 캐시에서 결과 확인
    const cachedResult = memoryCache.get<CalculationResults>(cacheKey);
    if (cachedResult) {
      const endTime = performance.now();
      return {
        ...cachedResult,
        processingTime: Math.round(endTime - startTime),
        fromCache: true,
      };
    }

    // 가격 계산 (재시도 로직 적용)
    const adaptedRequest = {
      ...request,
      deliveryDate: request.deliveryDate ? new Date(request.deliveryDate) : undefined,
    };

    const results = await retry(
      () => priceCalculator.calculate(adaptedRequest, 0), // API에서는 디바운스 없이 즉시 계산
      2, // 최대 2번 재시도
      500, // 500ms 대기
      2 // 지수 백오프
    );

    // 최적 수량 및 추천사항 계산
    const bestUnitPrice = Math.min(...results.map(r => r.unitPrice));
    const bestResult = results.find(r => r.unitPrice === bestUnitPrice);
    const economyRate = ((Math.max(...results.map(r => r.unitPrice)) - bestUnitPrice) /
                        Math.max(...results.map(r => r.unitPrice))) * 100;

    // 추천사항 생성
    const recommendations: string[] = [];

    if (economyRate > 10) {
      recommendations.push(`${bestResult?.quantity}個で最も単価が安くなります（${economyRate.toFixed(1)}%節約）`);
    }

    if (request.orderType === 'repeat') {
      recommendations.push('リピート注文は5%割引が適用されます');
    }

    if (request.materialGenre.includes('al')) {
      recommendations.push('アルミ箔素材はバリア性が高く、長期保存に適しています');
    }

    // 기본 가격 정보 계산 (평균 단가 기준)
    const avgUnitPrice = results.reduce((sum, r) => sum + r.unitPrice, 0) / results.length;
    const basePrice = avgUnitPrice * 0.7; // 기본 가격을 70%로 가정
    const materialMultiplier = request.materialGenre.includes('al') ? 1.2 : 1.0;
    const sizeMultiplier = (request.width * request.height) / 10000; // cm² 기준
    const quantityDiscount = 1 - (economyRate / 100);

    const endTime = performance.now();

    const calculationResult = {
      results,
      comparison: {
        bestQuantity: bestResult?.quantity || 0,
        bestUnitPrice,
        economyRate,
        recommendations,
      },
      calculation: {
        basePrice,
        materialMultiplier,
        sizeMultiplier,
        quantityDiscount,
        calculatedAt: new Date().toISOString(),
      },
      processingTime: Math.round(endTime - startTime),
      fromCache: false,
    };

    // 결과를 캐시에 저장 (5분 TTL)
    memoryCache.set(cacheKey, calculationResult, 300000);

    return calculationResult;
  } catch (error) {
    console.error('Calculation error:', error);
    throw new Error('가격 계산 중 오류가 발생했습니다.');
  }
}

// API 핸들러
const handler = async (req: NextRequest) => {
  // HTTP 메소드 검증
  if (req.method !== 'POST') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'POST 메소드만 허용됩니다.',
        },
        metadata: {
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          processingTime: 0,
        },
      } as QuotationResponse,
      { status: 405 }
    );
  }

  try {
    // 요청 본문 파싱
    const body = await req.json();
    const requestId = crypto.randomUUID();

    // 요청 데이터 검증
    const validatedData = QuotationRequestSchema.parse(body);

    // 견적 계산
    const calculationResult = await calculateQuotation(validatedData);

    const response: QuotationResponse = {
      success: true,
      data: calculationResult,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: calculationResult.processingTime,
        fromCache: calculationResult.fromCache || false,
      },
    };

    // 성공 응답
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    const requestId = crypto.randomUUID();

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
            message: '入力値が正しくありません。',
            details,
          },
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            processingTime: 0,
          },
        } as QuotationResponse,
        { status: 400 }
      );
    }

    // 일반 에러 처리
    console.error('API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '予期せぬエラーが発生しました。',
        },
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: 0,
        },
      } as QuotationResponse,
      { status: 500 }
    );
  }
};

// 성능 모니터링과 함께 핸들러 내보내기
export const POST = withPerformanceMonitoring(handler);

// CORS 설정 (필요시)
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