'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FlagBadgeProps {
  type: 'safe' | 'warning' | 'critical' | 'under_review' | 'resolved'
  label?: string
}

const ICON_PATHS: Record<FlagBadgeProps['type'], { d: string; d2?: string }> = {
  safe: { d: 'm4.5 12.75 6 6 9-13.5' },
  warning: { d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z' },
  critical: { d: 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z' },
  under_review: {
    d: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
    d2: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  },
  resolved: { d: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
}

const VARIANT_MAP: Record<FlagBadgeProps['type'], 'safe' | 'warning' | 'critical' | 'review'> = {
  safe: 'safe',
  warning: 'warning',
  critical: 'critical',
  under_review: 'review',
  resolved: 'safe',
}

const DEFAULT_LABELS: Record<FlagBadgeProps['type'], string> = {
  safe: 'Clear',
  warning: 'Flagged',
  critical: 'Critical',
  under_review: 'Under Review',
  resolved: 'Resolved',
}

export function FlagBadge({ type, label }: FlagBadgeProps) {
  const variant = VARIANT_MAP[type]
  const displayLabel = label || DEFAULT_LABELS[type]
  const icon = ICON_PATHS[type]

  return (
    <Badge
      variant={variant}
      className={cn('inline-flex items-center gap-1.5')}
      role="status"
      aria-label={`Flag status: ${displayLabel}`}
    >
      <svg
        className={cn('w-3.5 h-3.5')}
        aria-hidden="true"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon.d} />
        {icon.d2 && (
          <path strokeLinecap="round" strokeLinejoin="round" d={icon.d2} />
        )}
      </svg>
      {displayLabel}
    </Badge>
  )
}
