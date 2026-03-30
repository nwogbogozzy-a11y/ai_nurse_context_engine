'use client'

import { AuditLogEntry } from '@/lib/types'
import { formatNoteTimestamp } from '@/lib/format-time'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ActivityTimelineProps {
  entries: AuditLogEntry[]
}

const ACTION_LABELS: Record<string, (meta: Record<string, unknown>) => string> = {
  approved: () => 'approved flagged note',
  escalated: () => 'escalated note for review',
  overridden: () => 'overridden AI flag',
  under_review: () => 'marked note as under review',
  resolved: () => 'resolved flagged note',
  'confirm-supply': () => 'confirmed supply checklist',
  'generate-handoff': () => 'generated handoff report',
  'create-note': (meta) => `created clinical note${meta.flagged ? ' (flagged)' : ''}`,
}

const ACTION_BADGE_VARIANT: Record<string, 'safe' | 'warning' | 'critical' | 'default'> = {
  approved: 'safe',
  resolved: 'safe',
  escalated: 'warning',
  overridden: 'critical',
  'confirm-supply': 'safe',
  'generate-handoff': 'default',
}

const getInitials = (name: string): string =>
  name.split(' ').map(n => n[0]).join('').toUpperCase()

const getActionLabel = (actionType: string, metadata: Record<string, unknown>): string => {
  const labelFn = ACTION_LABELS[actionType]
  if (labelFn) return labelFn(metadata)
  return actionType.replace(/[-_]/g, ' ')
}

export function ActivityTimeline({ entries }: ActivityTimelineProps) {
  if (entries.length === 0) {
    return (
      <Card className={cn('text-center py-12')}>
        <CardContent className={cn('p-0')}>
          <p className={cn('text-sm font-medium text-primary mb-1')}>No activity recorded</p>
          <p className={cn('text-xs text-muted')}>Actions taken on this patient will appear here as they happen.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <ol className={cn('space-y-0')}>
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1
        const badgeVariant = ACTION_BADGE_VARIANT[entry.action_type]

        return (
          <li key={entry.id} className={cn('relative flex gap-3 pb-4')}>
            {/* Vertical connector line */}
            {!isLast && (
              <div className={cn('absolute left-3.5 top-7 bottom-0 w-px bg-border')} aria-hidden="true" />
            )}

            {/* Nurse initial circle */}
            <div
              className={cn('w-7 h-7 bg-surface border border-border rounded-full flex items-center justify-center shrink-0')}
              aria-label={entry.nurse_name}
            >
              <span className={cn('text-xs font-semibold text-secondary')}>
                {getInitials(entry.nurse_name)}
              </span>
            </div>

            {/* Action text + timestamp */}
            <div className={cn('flex-1 min-w-0')}>
              <p className={cn('text-sm text-primary')}>
                {entry.nurse_name} {getActionLabel(entry.action_type, entry.metadata)}
                {badgeVariant && (
                  <Badge variant={badgeVariant} className={cn('ml-2 text-xs')}>
                    {entry.action_type.replace(/[-_]/g, ' ')}
                  </Badge>
                )}
              </p>
              <time
                dateTime={entry.created_at}
                className={cn('text-xs text-muted font-mono')}
                suppressHydrationWarning
              >
                {formatNoteTimestamp(entry.created_at)}
              </time>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
