'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface TimeoutRetryProps {
  onRetry: () => void
}

export function TimeoutRetry({ onRetry }: TimeoutRetryProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 py-4')}>
      <p className="text-sm text-secondary">
        Taking longer than expected. The server may be busy.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
