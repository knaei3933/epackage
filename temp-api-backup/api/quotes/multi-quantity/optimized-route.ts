// Optimized multi-quantity API route with advanced caching and performance improvements

import { NextRequest, NextResponse } from 'next/server';
import { optimizedMultiQuantityCalculator } from '@/lib/multi-quantity-calculator.optimized';
import { MultiQuantityRequest } from '@/types/multi-quantity';

// Simple in-memory cache for edge runtime
const cache = new Map<string, { data: any; timestamp: number; etag?: string }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const MAX_CACHE_SIZE = 100;

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

// Performance monitoring
const performanceMetrics = {
  requestCount: 0,
  cacheHits: 0,
  averageResponseTime: 0,
  errorCount: 0
};

// Middleware for caching
function withCache<T>(
  handler: (req: NextRequest) => Promise<T>,
  generateCacheKey: (req: NextRequest) => string,
  ttl: number = CACHE_TTL
) {
  return async (req: NextRequest): Promise<T> => {
    const cacheKey = generateCacheKey(req);
    performanceMetrics.requestCount++;

    // Check cache
    const cached = cache.get(cacheKey);
    const ifNoneMatch = req.headers.get('if-none-match');

    if (cached && Date.now() - cached.timestamp < ttl) {
      performanceMetrics.cacheHits++;

      // Handle ETag validation
      if (ifNoneMatch && cached.etag === ifNoneMatch) {
        return new NextResponse(null, { status: 304 }) as T;
      }

      // Return cached response with cache headers
      const response = NextResponse.json(cached.data, {
        status: 200,
        headers: {
          'Cache-Control': `public, max-age=${Math.floor(ttl / 1000)}`,
          'ETag': cached.etag || '',
          'X-Cache': 'HIT'
        }
      });

      return response as T;
    }

    // Execute handler
    const startTime = Date.now();
    try {
      const result = await handler(req);
      const duration = Date.now() - startTime;

      // Update average response time
      performanceMetrics.averageResponseTime =
        (performanceMetrics.averageResponseTime + duration) / 2;

      // Generate ETag
      const etag = generateETag(result);

      // Cache the result
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        etag
      });

      // Clean old cache entries
      if (cache.size > MAX_CACHE_SIZE) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey) {
          cache.delete(oldestKey);
        }
      }

      // Return response with cache headers
      const response = NextResponse.json(result, {
        status: 200,
        headers: {
          'Cache-Control': `public, max-age=${Math.floor(ttl / 1000)}`,
          'ETag': etag,
          'X-Cache': 'MISS',
          'X-Response-Time': `${duration}ms`
        }
      });

      return response as T;
    } catch (error) {
      performanceMetrics.errorCount++;
      throw error;
    }
  };
}

// Rate limiting middleware
function withRateLimit(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();

    // Check rate limit
    const clientData = rateLimitStore.get(clientIP);

    if (!clientData || now > clientData.resetTime) {
      // Reset or initialize counter
      rateLimitStore.set(clientIP, {
        count: 1,
        resetTime: now + RATE_WINDOW
      });
    } else if (clientData.count >= RATE_LIMIT) {
      // Rate limit exceeded
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': clientData.resetTime.toString()
          }
        }
      );
    } else {
      // Increment counter
      clientData.count++;
    }

    // Add rate limit headers
    const response = await handler(req);
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
    response.headers.set(
      'X-RateLimit-Remaining',
      Math.max(0, RATE_LIMIT - (clientData?.count || 0)).toString()
    );
    response.headers.set('X-RateLimit-Reset', clientData?.resetTime.toString() || '');

    return response;
  };
}

// Generate ETag from data
function generateETag(data: any): string {
  const hash = require('crypto')
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex');
  return `"${hash}"`;
}

// Main handler
async function handleMultiQuantityRequest(req: NextRequest) {
  try {
    // Parse request body
    const body: MultiQuantityRequest = await req.json();

    // Validate request
    const validation = validateMultiQuantityRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400 }
      );
    }

    // Process with optimized calculator
    const result = await optimizedMultiQuantityCalculator.calculateMultiQuantity(body);

    // Add metadata
    const enhancedResult = {
      ...result,
      metadata: {
        ...result.metadata,
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        performance: {
          fromCache: false, // Using direct calculation, not cached
          processingTime: result.metadata.processingTime,
          cacheSize: 0 // Not using cache in this implementation
        }
      }
    };

    return NextResponse.json(enhancedResult);
  } catch (error) {
    console.error('Multi-quantity calculation error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId: crypto.randomUUID()
      },
      { status: 500 }
    );
  }
}

// Validation function
function validateMultiQuantityRequest(request: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.baseParams) {
    errors.push('Base parameters are required');
  } else {
    // Validate baseParams
    if (!request.baseParams.bagTypeId) {
      errors.push('Bag type is required');
    }
    if (!request.baseParams.materialId) {
      errors.push('Material is required');
    }
    if (!request.baseParams.width || request.baseParams.width <= 0) {
      errors.push('Valid width is required');
    }
    if (!request.baseParams.height || request.baseParams.height <= 0) {
      errors.push('Valid height is required');
    }
    if (request.baseParams.depth !== undefined && request.baseParams.depth < 0) {
      errors.push('Depth cannot be negative');
    }
  }

  if (!request.quantities || !Array.isArray(request.quantities)) {
    errors.push('Quantities array is required');
  } else {
    if (request.quantities.length === 0) {
      errors.push('At least one quantity is required');
    }
    if (request.quantities.length > 10) {
      errors.push('Maximum 10 quantities allowed');
    }
    if (!request.quantities.every((q: number) => Number.isInteger(q) && q >= 500 && q <= 1000000)) {
      errors.push('All quantities must be integers between 500 and 1,000,000');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    metrics: performanceMetrics,
    cache: {
      size: cache.size,
      maxSize: MAX_CACHE_SIZE
    },
    calculator: optimizedMultiQuantityCalculator.getCacheStats()
  });
}

// Apply middleware and export POST handler
export const POST = withRateLimit(
  withCache(handleMultiQuantityRequest, (req) => {
    // Generate cache key from request body and selected headers
    const url = new URL(req.url);
    return `${url.pathname}:${JSON.stringify(req.headers.get('authorization'))}:${JSON.stringify(req.body)}`;
  })
);