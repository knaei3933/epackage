import { NextRequest, NextResponse } from 'next/server'

// Configure for static export compatibility
export const dynamic = 'force-static'
export const revalidate = false

interface ErrorLog {
  error: {
    name: string
    message: string
    stack?: string
  }
  errorInfo?: {
    componentStack?: string
  }
  additionalInfo?: string
  timestamp: string
  userAgent: string
  url: string
  manual?: boolean
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
      console.groupEnd()
    }

    // In production, you would send this to your error logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, or custom logging service
      // await logToService(errorLog)

      // For now, just log to console with structured format
      console.error(JSON.stringify({
        level: 'error',
        message: errorLog.error.message,
        error: errorLog.error,
        metadata: {
          timestamp: errorLog.timestamp,
          url: errorLog.url,
          userAgent: errorLog.userAgent,
          manual: errorLog.manual,
          additionalInfo: errorLog.additionalInfo,
          errorInfo: errorLog.errorInfo
        }
      }, null, 2))
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