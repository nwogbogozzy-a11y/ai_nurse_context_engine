'use client'

interface FlagBadgeProps {
  type: 'safe' | 'warning' | 'critical'
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
      {label || c.defaultLabel}
    </span>
  )
}
