import { NextRequest, NextResponse } from 'next/server'

// Configure for static export compatibility
export const dynamic = 'force-static'
export const revalidate = false

interface ErrorLog {
  error: {
    name: string
    message: string
    stack?: string
    code?: string
    digest?: string
  }
  errorInfo?: {
    componentStack?: string
  }
  additionalInfo?: string
  timestamp: string
  userAgent: string
  url: string
  manual?: boolean
  boundary?: string
  global?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const errorLog: ErrorLog = await request.json()

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Client Error Log')
      console.error('Error:', errorLog.error)
      if (errorLog.errorInfo) {
        console.error('Error Info:', errorLog.errorInfo)
      }
      if (errorLog.additionalInfo) {
        console.error('Additional Info:', errorLog.additionalInfo)
      }
      console.error('Timestamp:', errorLog.timestamp)
      console.error('URL:', errorLog.url)
      console.error('User Agent:', errorLog.userAgent)
      console.error('Boundary:', errorLog.boundary)
      console.error('Global:', errorLog.global)
      console.groupEnd()
    }

    // In production, persist error details to server logs if enabled.
    // NOTE: 専用 error_logs テーブルは実DBに存在しないため、DB保存ではなく
    // サーバログ（console.error）へ集約。Sentry 等の外部連携は下記ブロックで継続。
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_ERROR_LOGGING === 'true') {
      try {
        console.error('[Client Error]', {
          errorName: errorLog.error.name,
          errorMessage: errorLog.error.message,
          errorStack: errorLog.error.stack,
          errorCode: errorLog.error.code,
          errorDigest: errorLog.error.digest,
          componentStack: errorLog.errorInfo?.componentStack,
          userAgent: errorLog.userAgent,
          url: errorLog.url,
          boundary: errorLog.boundary,
          isGlobal: errorLog.global,
          isManual: errorLog.manual,
          additionalInfo: errorLog.additionalInfo,
          timestamp: errorLog.timestamp,
        })
      } catch (logError) {
        console.error('Error logging failed:', logError)
      }
    }

    // External error tracking service integration (optional)
    if (process.env.SENTRY_DSN) {
      // Sentry integration example
      // Sentry.captureException(new Error(errorLog.error.message))
    }

    return NextResponse.json({ success: true, message: 'Error logged successfully' })
  } catch (error) {
    console.error('Failed to log error:', error)
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    )
  }
}

// OPTIONS method support for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}