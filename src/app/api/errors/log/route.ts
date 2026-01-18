import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

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

    // In production, save to database if enabled
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_ERROR_LOGGING === 'true') {
      try {
        const supabase = createServiceClient()

        const { error: dbError } = await supabase
          .from('error_logs')
          .insert({
            error_name: errorLog.error.name,
            error_message: errorLog.error.message,
            error_stack: errorLog.error.stack,
            error_code: errorLog.error.code,
            error_digest: errorLog.error.digest,
            component_stack: errorLog.errorInfo?.componentStack,
            user_agent: errorLog.userAgent,
            url: errorLog.url,
            boundary: errorLog.boundary,
            is_global: errorLog.global || false,
            is_manual: errorLog.manual || false,
            additional_info: errorLog.additionalInfo,
            created_at: errorLog.timestamp,
          })

        if (dbError) {
          console.error('Failed to save error log to database:', dbError)
        }
      } catch (dbError) {
        console.error('Database error logging failed:', dbError)
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