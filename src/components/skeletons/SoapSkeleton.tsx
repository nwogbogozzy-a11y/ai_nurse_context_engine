'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export function SoapSkeleton() {
  return (
    <div className={cn('space-y-4')} role="status" aria-busy="true" aria-label="Loading SOAP note">
      {/* Subjective */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted">Subjective</span>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[70%]" />
      </div>

      {/* Objective */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted">Objective</span>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>

      {/* Assessment */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted">Assessment</span>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[70%]" />
      </div>

      {/* Plan */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted">Plan</span>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[85%]" />
      </div>

      <span className="sr-only">Loading structured note...</span>
    </div>
  )
}
