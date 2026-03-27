'use client'

interface FlagBadgeProps {
  type: 'safe' | 'warning' | 'critical' | 'under_review' | 'resolved'
  label?: string
}

export function FlagBadge({ type, label }: FlagBadgeProps) {
  const config = {
    safe: {
      bg: 'bg-flag-safe-bg',
      text: 'text-flag-safe',
      dot: 'bg-flag-safe',
      defaultLabel: 'Clear',
    },
    warning: {
      bg: 'bg-flag-warning-bg',
      text: 'text-flag-warning',
      dot: 'bg-flag-warning',
      defaultLabel: 'Flagged',
    },
    critical: {
      bg: 'bg-flag-critical-bg',
      text: 'text-flag-critical',
      dot: 'bg-flag-critical',
      defaultLabel: 'Critical',
    },
    under_review: {
      bg: 'bg-flag-review-bg',
      text: 'text-flag-review',
      dot: 'bg-flag-review',
      defaultLabel: 'Under Review',
    },
    resolved: {
      bg: 'bg-flag-safe-bg',
      text: 'text-flag-safe',
      dot: 'bg-flag-safe',
      defaultLabel: 'Resolved',
    },
  }

  const c = config[type]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
      role="status"
    >
      {type === 'safe' && (
        <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      )}
      {type === 'warning' && (
        <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      )}
      {type === 'critical' && (
        <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      )}
      {type === 'under_review' && (
        <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      )}
      {type === 'resolved' && (
        <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )}
      {label || c.defaultLabel}
    </span>
  )
}
