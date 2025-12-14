'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  enableRetry?: boolean
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to monitoring service
    this.logError(error, errorInfo)

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', errorData)
    }

    // Send to monitoring service
    this.sendToMonitoringService(errorData)
  }

  private sendToMonitoringService = async (errorData: any) => {
    try {
      // Send to your monitoring service (Sentry, LogRocket, etc.)
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        // Example: Sentry.captureException(error, { extra: errorData })
      }

      // Or send to custom endpoint
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      })
    } catch (err) {
      console.warn('Failed to send error to monitoring service:', err)
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    })
  }

  private goHome = () => {
    window.location.href = '/'
  }

  private reportBug = () => {
    const subject = encodeURIComponent('Bug Report - Epackage Lab')
    const body = encodeURIComponent(`
Error: ${this.state.error?.message}
Component Stack: ${this.state.errorInfo?.componentStack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Time: ${new Date().toISOString()}
    `)

    window.location.href = `mailto:support@epackage-lab.com?subject=${subject}&body=${body}`
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                予期しないエラーが発生しました
              </h1>
              <p className="mt-2 text-gray-600">
                申し訳ありませんが、アプリケーションでエラーが発生しました。
                以下のオプションから操作を選択してください。
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {/* Retry Button */}
              {this.props.enableRetry && this.state.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  再試行 ({this.maxRetries - this.state.retryCount} 回残り)
                </button>
              )}

              {/* Reset Button */}
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                リセット
              </button>

              {/* Go Home */}
              <button
                onClick={this.goHome}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                ホームに戻る
              </button>

              {/* Report Bug */}
              <button
                onClick={this.reportBug}
                className="w-full flex items-center justify-center px-4 py-3 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
              >
                <Bug className="w-5 h-5 mr-2" />
                バグを報告
              </button>
            </div>

            {/* Error Details (in development or if enabled) */}
            {(process.env.NODE_ENV === 'development' || this.props.showDetails) && this.state.error && (
              <details className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
                <summary className="text-sm font-medium text-red-900 cursor-pointer">
                  エラー詳細
                </summary>
                <div className="mt-2 text-sm text-red-800">
                  <p className="font-semibold">エラーメッセージ:</p>
                  <pre className="mt-1 p-2 bg-red-100 rounded overflow-x-auto text-xs">
                    {this.state.error.message}
                  </pre>

                  {this.state.error.stack && (
                    <>
                      <p className="font-semibold mt-3">スタックトレース:</p>
                      <pre className="mt-1 p-2 bg-red-100 rounded overflow-x-auto text-xs">
                        {this.state.error.stack}
                      </pre>
                    </>
                  )}

                  {this.state.errorInfo?.componentStack && (
                    <>
                      <p className="font-semibold mt-3">コンポーネントスタック:</p>
                      <pre className="mt-1 p-2 bg-red-100 rounded overflow-x-auto text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}

            {/* Retry Information */}
            {this.state.retryCount >= this.maxRetries && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  最大再試行回数に達しました。ページを再読み込みするか、ホームに戻ってください。
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Hook for functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    console.error('Caught error in error boundary:', error, errorInfo)

    // Log to monitoring service
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    fetch('/api/errors/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorData)
    }).catch(err => {
      console.warn('Failed to send error to monitoring service:', err)
    })
  }, [])

  return { handleError }
}

// Higher-order component for error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}