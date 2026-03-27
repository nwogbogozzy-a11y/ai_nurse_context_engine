'use client'

import { AuditLogEntry } from '@/lib/types'
import { formatNoteTimestamp } from '@/lib/format-time'

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
      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <p className="text-sm font-medium text-primary">No activity recorded</p>
        <p className="text-xs text-muted mt-1">Actions taken on this patient will appear here as they happen.</p>
      </div>
    )
  }

  return (
    <ol className="space-y-0">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1

        return (
          <li key={entry.id} className="relative flex gap-3 pb-4">
            {/* Vertical connector line */}
            {!isLast && (
              <div className="absolute left-3.5 top-7 bottom-0 w-px bg-border" aria-hidden="true" />
            )}

            {/* Nurse initial circle */}
            <div
              className="w-7 h-7 bg-surface border border-border rounded-full flex items-center justify-center shrink-0"
              aria-label={entry.nurse_name}
            >
              <span className="text-xs font-semibold text-secondary">
                {getInitials(entry.nurse_name)}
              </span>
            </div>

            {/* Action text + timestamp */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-primary">
                {entry.nurse_name} {getActionLabel(entry.action_type, entry.metadata)}
              </p>
              <time
                dateTime={entry.created_at}
                className="text-xs text-muted"
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
