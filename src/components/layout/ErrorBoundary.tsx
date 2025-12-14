'use client'

import React, { Component, ErrorInfo, ReactNode, useState } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  enableRetry?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

interface ErrorDisplayProps {
  error: Error
  errorInfo: ErrorInfo
  onRetry: () => void
  onGoHome: () => void
  showDetails?: boolean
  retryCount: number
}

/**
 * Error Display Component
 */
function ErrorDisplay({
  error,
  errorInfo,
  onRetry,
  onGoHome,
  showDetails = false,
  retryCount,
}: ErrorDisplayProps) {
  const { tn } = useTranslation()
  const [showErrorDetails, setShowErrorDetails] = useState(false)

  const handleReportError = () => {
    const subject = encodeURIComponent('Epackage Lab Error Report')
    const body = encodeURIComponent(`
Error Details:
- Error: ${error.name}: ${error.message}
- Stack: ${error.stack}
- Component Stack: ${errorInfo.componentStack}
- URL: ${window.location.href}
- User Agent: ${navigator.userAgent}
- Timestamp: ${new Date().toISOString()}
- Retry Count: ${retryCount}
    `)

    window.open(`mailto:support@epackagelab.jp?subject=${subject}&body=${body}`)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <Container size="md">
        <Card variant="elevated" className="p-8 text-center max-w-2xl mx-auto">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-error-50 rounded-full">
              <AlertTriangle className="h-12 w-12 text-error-500" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {tn('errors', 'unknownError')}
          </h1>

          {/* Error Description */}
          <p className="text-text-secondary mb-8 leading-relaxed">
            {tn('errors', 'tryAgain')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              variant="primary"
              onClick={onRetry}
              className="flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>{tn('common', 'retry')}</span>
              {retryCount > 0 && (
                <span className="text-xs opacity-75">({retryCount})</span>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onGoHome}
              className="flex items-center justify-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>{tn('errors', 'goHome')}</span>
            </Button>

            {showDetails && (
              <Button
                variant="ghost"
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="flex items-center justify-center space-x-2"
              >
                <Bug className="h-4 w-4" />
                <span>{showErrorDetails ? '詳細を隠す' : '詳細を表示'}</span>
              </Button>
            )}
          </div>

          {/* Report Error Option */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReportError}
              className="text-text-tertiary hover:text-text-primary inline-flex items-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>エラーを報告</span>
            </Button>
          </div>

          {/* Error Details (Collapsible) */}
          {showDetails && showErrorDetails && (
            <div className="mt-8 p-4 bg-bg-muted rounded-lg text-left">
              <h3 className="text-sm font-semibold text-text-primary mb-3 font-mono">
                Error Details
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-medium text-text-secondary">Error:</span>
                  <pre className="mt-1 p-2 bg-bg-secondary rounded text-error-600 overflow-x-auto">
                    {error.name}: {error.message}
                  </pre>
                </div>

                <div>
                  <span className="font-medium text-text-secondary">Stack Trace:</span>
                  <pre className="mt-1 p-2 bg-bg-secondary rounded text-error-600 overflow-x-auto max-h-32 overflow-y-auto">
                    {error.stack}
                  </pre>
                </div>

                {errorInfo.componentStack && (
                  <div>
                    <span className="font-medium text-text-secondary">Component Stack:</span>
                    <pre className="mt-1 p-2 bg-bg-secondary rounded text-error-600 overflow-x-auto max-h-32 overflow-y-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}

                <div>
                  <span className="font-medium text-text-secondary">URL:</span>
                  <p className="mt-1 p-2 bg-bg-secondary rounded text-text-secondary font-mono">
                    {window.location.href}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-text-secondary">Timestamp:</span>
                  <p className="mt-1 p-2 bg-bg-secondary rounded text-text-secondary font-mono">
                    {new Date().toISOString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </Container>
    </div>
  )
}

/**
 * Error Boundary Class Component
 */
export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // In production, you might want to log to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: logToErrorService(error, errorInfo)
    }
  }

  handleRetry = () => {
    // Don't allow infinite retries
    if (this.state.retryCount >= this.maxRetries) {
      return
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }))
  }

  handleGoHome = () => {
    // Reset error state and navigate to home
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    })

    // Navigate to home
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback component
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error display - ensure errorInfo is not null
      const errorInfo = this.state.errorInfo || {
        componentStack: 'No component stack available'
      }

      return (
        <ErrorDisplay
          error={this.state.error}
          errorInfo={errorInfo}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          showDetails={this.props.showDetails || process.env.NODE_ENV === 'development'}
          retryCount={this.state.retryCount}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Hook-based Error Boundary
 */
interface ErrorBoundaryWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  enableRetry?: boolean
}

export function ErrorBoundaryWrapper({
  children,
  fallback,
  onError,
  showDetails,
  enableRetry = true,
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={onError}
      showDetails={showDetails}
      enableRetry={enableRetry}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Specialized error boundaries for different contexts
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Log page errors
        console.error('Page Error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-error-200 bg-error-50 rounded-lg">
          <div className="flex items-center space-x-2 text-error-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">コンポーネントの読み込みエラー</span>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        // Log component errors
        console.error('Component Error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <Card className="p-6 text-center">
          <RefreshCw className="h-8 w-8 text-brixa-600 mx-auto mb-4 animate-spin" />
          <p className="text-text-secondary">再試行中...</p>
        </Card>
      }
      onError={(error, errorInfo) => {
        // Log async errors
        console.error('Async Error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary