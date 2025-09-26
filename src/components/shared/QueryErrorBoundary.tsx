"use client"

import React from 'react'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from './ErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface QueryErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * Error boundary specifically for React Query errors
 * Automatically resets query cache when retrying
 */
export function QueryErrorBoundary({ 
  children, 
  fallback, 
  onError 
}: QueryErrorBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary()

  const handleRetry = () => {
    reset()
  }

  const defaultFallback = (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            Data Loading Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            There was an issue loading your data. This might be a temporary network issue.
          </p>
          
          <Button 
            onClick={handleRetry}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <ErrorBoundary
      fallback={fallback || defaultFallback}
      onError={onError}
      level="page"
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Component-level query error boundary
 */
export function QueryErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
        <span className="text-sm font-medium text-yellow-800">
          Data Loading Error
        </span>
      </div>
      <p className="text-sm text-yellow-700 mb-3">
        Failed to load data: {error.message}
      </p>
      <Button 
        onClick={resetErrorBoundary}
        size="sm"
        variant="outline"
        className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
      >
        <RefreshCw className="w-3 h-3 mr-1" />
        Retry
      </Button>
    </div>
  )
}
