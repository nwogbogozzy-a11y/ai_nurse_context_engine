'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function SupplySkeleton() {
  return (
    <Card role="status" aria-busy="true" aria-label="Loading supply checklist">
      <CardContent className={cn('p-4')}>
        {/* Table header */}
        <div className="flex gap-4 pb-3 border-b border-border">
          <span className="w-40 text-xs font-medium uppercase tracking-wide text-secondary">Item</span>
          <span className="w-8 text-xs font-medium uppercase tracking-wide text-secondary">Qty</span>
          <span className="w-16 text-xs font-medium uppercase tracking-wide text-secondary">Unit</span>
          <span className="w-32 text-xs font-medium uppercase tracking-wide text-secondary">Notes</span>
        </div>

        {/* Shimmer rows */}
        <div className="space-y-3 pt-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        <span className="sr-only">Loading supply checklist...</span>
      </CardContent>
    </Card>
  )
}
