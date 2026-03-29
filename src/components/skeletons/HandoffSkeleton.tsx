'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export function HandoffSkeleton() {
  return (
    <div className={cn('space-y-4')} role="status" aria-busy="true" aria-label="Loading handoff report">
      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <span className="text-xs font-medium uppercase tracking-wide text-secondary">Summary</span>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </CardContent>
      </Card>

      {/* Priority Flags */}
      <Card>
        <CardHeader className="pb-2">
          <span className="text-xs font-medium uppercase tracking-wide text-secondary">Priority Flags</span>
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stable Items */}
      <Card>
        <CardHeader className="pb-2">
          <span className="text-xs font-medium uppercase tracking-wide text-secondary">Stable Items</span>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-4 w-[60%]" />
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card>
        <CardHeader className="pb-2">
          <span className="text-xs font-medium uppercase tracking-wide text-secondary">Recommended Actions</span>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-[70%]" />
          <Skeleton className="h-4 w-[70%]" />
        </CardContent>
      </Card>

      <span className="sr-only">Loading handoff report...</span>
    </div>
  )
}
