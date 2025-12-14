'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  Bug,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: { componentStack: string } | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: { componentStack: string }) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = ErrorBoundary.getDerivedStateFromError(props, {
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  static getDerivedStateFromError(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState
  ): ErrorBoundaryState {
    return {
      hasError: true,
      error: state.error || new Error('Unknown error occurred'),
      errorInfo: state.errorInfo || { componentStack: '' }
    }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    this.setState({ error, errorInfo })

    // Log error to error reporting service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo)

      // You can integrate error reporting services here
      // Example: Sentry.captureException(error, {
      //   contexts: [
      //     { name: 'componentStack', data: errorInfo },
      //   ],
      // })
    }
  }

  render() {
    const { children, fallback: FallbackComponent } = this.props
    const { hasError, error } = this.state

    if (hasError && error) {
      // Use provided fallback or default
      if (FallbackComponent) {
        return <FallbackComponent error={error} resetError={this.resetError} />
      }
      return <DefaultErrorFallback error={error} resetError={this.resetError} />
    }

    return children
  }

  private resetError = () => {
    this.setState(ErrorBoundary.getInitialState(this.props))
  }

  private static getInitialState(props: ErrorBoundaryProps): ErrorBoundaryState {
    return {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }
}

// Default fallback component
function DefaultErrorFallback({ error, resetError }: {
  error: Error;
  resetError: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Container size="4xl">
        <div className="max-w-2xl mx-auto text-center">
          {/* Error Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            予期しないエラーが発生しました
          </h1>

          {/* Error Message */}
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
                <Bug className="w-5 h-5 mr-2" />
                エラーメッセージ
              </h2>
              <p className="text-red-700 text-sm font-mono bg-white rounded p-2 text-left">
                {error.message || '不明なエラーが発生しました'}
              </p>
            </div>

            {/* Development Details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg p-3">
                  開発モードの詳細情報
                </summary>
                <div className="mt-3 p-3 bg-gray-100 rounded border border-gray-300 text-left">
                  <h3 className="font-semibold text-gray-800 mb-2">エラー詳細:</h3>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>

          {/* Error Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={resetError}
              variant="primary"
              size="lg"
              className="flex items-center justify-center min-w-[160px]"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              ページを再読み込み
            </Button>

            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-center min-w-[160px]"
              >
                <Home className="w-5 h-5 mr-2" />
                ホームに戻る
              </Button>
            </Link>

            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              size="lg"
              className="flex items-center justify-center min-w-[160px]"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              前のページに戻る
            </Button>
          </div>

          {/* Additional Help */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-800">問題が解決しない場合</h3>
            </div>
            <p className="text-blue-700 text-sm mb-4">
              上記の解決策で問題が解決しない場合は、サポートチームまでご連絡ください。
            </p>
            <Link href="/contact">
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-100">
                サポートにお問い合わせ
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}

// Custom fallback component for specific contexts
export function CustomErrorFallback({
  error,
  resetError,
  title = "エラーが発生しました",
  description,
  showHomeButton = true,
  customActions
}: {
  error: Error
  resetError: () => void
  title?: string
  description?: string
  showHomeButton?: boolean
  customActions?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Container size="4xl">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-orange-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h1>

          {description && (
            <p className="text-lg text-gray-600 mb-8">
              {description}
            </p>
          )}

          {customActions || (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={resetError}
                variant="primary"
                size="lg"
                className="flex items-center justify-center min-w-[160px]"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                再試行
              </Button>

              {showHomeButton && (
                <Link href="/">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center justify-center min-w-[160px]"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    ホームに戻る
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

// Hook for reporting errors programmatically
export function useErrorBoundary() {
  return React.useContext(ErrorBoundaryContext) as {
    reportError: (error: Error) => void
  } | null
}

// Error boundary context for programmatic error reporting
export const ErrorBoundaryContext = React.createContext<{
  reportError: (error: Error) => void
} | null>(null)

export default ErrorBoundary