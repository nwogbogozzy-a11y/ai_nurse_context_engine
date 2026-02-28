'use client'

import { useState } from 'react'

interface NurseActionBarProps {
  noteId: string
  onAction: (action: 'approve' | 'escalate' | 'override') => void
}

export function NurseActionBar({ noteId, onAction }: NurseActionBarProps) {
  const [acted, setActed] = useState<string | null>(null)

  const handleAction = (action: 'approve' | 'escalate' | 'override') => {
    setActed(action)
    onAction(action)
  }

  if (acted) {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
          acted === 'approve' ? 'bg-flag-safe-bg text-flag-safe' :
          acted === 'escalate' ? 'bg-flag-warning-bg text-flag-warning' :
          'bg-surface text-secondary'
        }`}>
          {acted === 'approve' && (
            <><svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg> Approved</>
          )}
          {acted === 'escalate' && (
            <><svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg> Escalated</>
          )}
          {acted === 'override' && 'Overridden'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleAction('approve')}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-flag-safe text-accent-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-flag-safe focus-visible:ring-offset-2 transition-colors duration-150"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Approve
      </button>
      <button
        onClick={() => handleAction('escalate')}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border border-flag-warning text-flag-warning bg-background hover:bg-flag-warning-bg focus-visible:ring-2 focus-visible:ring-flag-warning focus-visible:ring-offset-2 transition-colors duration-150"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
        </svg>
        Escalate
      </button>
      <button
        onClick={() => handleAction('override')}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-secondary hover:text-primary hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors duration-150"
        aria-label="Override AI flag — use clinical judgment"
      >
        Override
      </button>
    </div>
  )
}
