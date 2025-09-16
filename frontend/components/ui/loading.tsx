import { AlertCircle, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface ErrorAlertProps {
  error: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function ErrorAlert({ error, onRetry, onDismiss, className }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={cn("mb-4", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="flex-1 mr-2">{error}</span>
        <div className="flex gap-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8 px-3 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn("animate-spin", sizeClasses[size], className)}>
      <RefreshCw className="h-full w-full" />
    </div>
  )
}

interface LoadingStateProps {
  isLoading: boolean
  error: string | null
  onRetry?: () => void
  onDismissError?: () => void
  children: React.ReactNode
  loadingMessage?: string
}

export function LoadingState({
  isLoading,
  error,
  onRetry,
  onDismissError,
  children,
  loadingMessage = "Loading..."
}: LoadingStateProps) {
  if (error) {
    return (
      <ErrorAlert
        error={error}
        onRetry={onRetry}
        onDismiss={onDismissError}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner className="mr-2" />
        <span className="text-muted-foreground">{loadingMessage}</span>
      </div>
    )
  }

  return <>{children}</>
}

interface NetworkStatusProps {
  isOnline: boolean
  className?: string
}

export function NetworkStatus({ isOnline, className }: NetworkStatusProps) {
  if (isOnline) return null

  return (
    <Alert variant="destructive" className={cn("mb-4", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        You are currently offline. Some features may not work properly.
      </AlertDescription>
    </Alert>
  )
}