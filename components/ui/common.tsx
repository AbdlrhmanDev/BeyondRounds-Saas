import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Enhanced loading spinner component with different sizes and variants
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  variant?: 'default' | 'minimal' | 'card'
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text,
  variant = 'default' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const spinner = (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  )

  if (variant === 'minimal') {
    return spinner
  }

  if (variant === 'card') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          {spinner}
          {text && (
            <p className="mt-4 text-sm text-gray-600 text-center">{text}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {spinner}
      {text && (
        <p className="text-sm text-gray-600 text-center">{text}</p>
      )}
    </div>
  )
}

/**
 * Enhanced error message component with retry functionality
 */
interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
  variant?: 'default' | 'card' | 'minimal'
  showRetry?: boolean
}

export function ErrorMessage({ 
  title = 'Something went wrong',
  message,
  onRetry,
  className,
  variant = 'default',
  showRetry = true
}: ErrorMessageProps) {
  const content = (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 max-w-md">{message}</p>
      </div>

      {showRetry && onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="bg-white hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )

  if (variant === 'minimal') {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{message}</span>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-8">
          {content}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-[200px] flex items-center justify-center p-4">
      {content}
    </div>
  )
}

/**
 * Empty state component for when there's no data
 */
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
  variant?: 'default' | 'card' | 'minimal'
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className,
  variant = 'default'
}: EmptyStateProps) {
  const content = (
    <div className={cn('text-center space-y-4', className)}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
        {icon}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">{description}</p>
      </div>

      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  )

  if (variant === 'minimal') {
    return (
      <div className="flex flex-col items-center space-y-2 py-4">
        {icon}
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <p className="text-xs text-gray-600 text-center">{description}</p>
        {action && action}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-8">
          {content}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-[200px] flex items-center justify-center p-4">
      {content}
    </div>
  )
}

/**
 * Loading skeleton component for better UX during data fetching
 */
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200'
  
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded',
    circular: 'rounded-full'
  }

  const style = {
    width: width || '100%',
    height: height || '1rem'
  }

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  )
}

/**
 * Loading skeleton for dashboard cards
 */
export function DashboardCardSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="space-y-2 flex-1">
            <Skeleton width="60%" height={20} />
            <Skeleton width="40%" height={16} />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton width="100%" height={16} />
          <Skeleton width="80%" height={16} />
          <Skeleton width="60%" height={16} />
        </div>
        <div className="flex space-x-2">
          <Skeleton width={80} height={32} />
          <Skeleton width={100} height={32} />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading skeleton for match cards
 */
export function MatchCardSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width={200} height={24} />
            <Skeleton width={120} height={16} />
          </div>
          <Skeleton width={80} height={24} />
        </div>
        
        <div className="flex items-center space-x-2">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton width={60} height={16} />
        </div>
        
        <div className="space-y-2">
          <Skeleton width="100%" height={16} />
          <Skeleton width="80%" height={16} />
        </div>
        
        <div className="flex space-x-2">
          <Skeleton width={100} height={36} />
          <Skeleton width={120} height={36} />
        </div>
      </CardContent>
    </Card>
  )
}