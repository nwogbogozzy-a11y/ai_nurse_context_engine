'use client'

import { PatientSummary } from '@/lib/types'
import { formatNoteTimestamp } from '@/lib/format-time'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface PatientContextSummaryProps {
  summary: PatientSummary | null
  loading?: boolean
}

export function PatientContextSummary({ summary, loading }: PatientContextSummaryProps) {
  if (loading) {
    return (
      <Card className={cn('p-6')}>
        <CardHeader className={cn('p-0 pb-3')}>
          <span className={cn('text-xs font-medium uppercase tracking-wide text-secondary')}>Patient Context</span>
        </CardHeader>
        <CardContent className={cn('p-0 space-y-2')}>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[70%]" />
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card className={cn('p-6')}>
        <CardHeader className={cn('p-0 pb-3')}>
          <h3 className={cn('text-lg font-semibold text-primary')}>Patient Context</h3>
        </CardHeader>
        <CardContent className={cn('p-0 text-center py-8')}>
          <p className={cn('text-sm font-medium text-primary mb-1')}>No context available yet</p>
          <p className={cn('text-sm text-muted')}>
            Submit a clinical note to generate the patient context summary. The AI builds context from documented observations.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6')} role="status">
      <CardHeader className={cn('p-0 pb-3 flex flex-row items-center justify-between space-y-0')}>
        <div>
          <h3 className={cn('text-lg font-semibold text-primary')}>Patient Context</h3>
          <p className={cn('text-xs font-semibold text-muted mt-1')}>
            AI-generated from last {summary.note_count} notes
          </p>
        </div>
        <span className={cn('text-xs text-muted')}>
          Updated {formatNoteTimestamp(summary.generated_at)}
        </span>
      </CardHeader>
      <CardContent className={cn('p-0')}>
        <p className={cn('text-sm leading-relaxed text-primary')}>
          {summary.summary}
        </p>
      </CardContent>
    </Card>
  )
}
