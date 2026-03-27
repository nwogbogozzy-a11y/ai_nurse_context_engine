'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNurse } from '@/contexts/NurseContext'
import { toast } from 'sonner'

interface NurseActionBarProps {
  noteId: string
  initialReviewStatus?: 'pending' | 'approved' | 'escalated' | 'overridden'
  initialReviewedBy?: string | null
  onAction: (action: 'approve' | 'escalate' | 'override') => void
}

export function NurseActionBar({ noteId, initialReviewStatus, initialReviewedBy, onAction }: NurseActionBarProps) {
  const { nurse } = useNurse()
  const [reviewStatus, setReviewStatus] = useState<string>(initialReviewStatus || 'pending')
  const [reviewedBy, setReviewedBy] = useState<string | null>(initialReviewedBy || null)
  const [saving, setSaving] = useState(false)

  const handleAction = async (action: 'approve' | 'escalate' | 'override') => {
    setSaving(true)
    const statusValue = action === 'approve' ? 'approved'
      : action === 'escalate' ? 'escalated'
      : 'overridden'

    const { error } = await supabase
      .from('notes')
      .update({
        review_status: statusValue,
        reviewed_by: nurse.name,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', noteId)

    setSaving(false)

    if (error) {
      toast.error(`Failed to ${action} note`)
      return
    }

    setReviewStatus(statusValue)
    setReviewedBy(nurse.name)
    toast.success(`Note ${statusValue} by ${nurse.name}`)
    onAction(action)
  }

  if (reviewStatus !== 'pending') {
    const displayLabel = reviewStatus === 'approved' ? 'Approved'
      : reviewStatus === 'escalated' ? 'Escalated'
      : 'Overridden'

    return (
      <div className="flex items-center gap-2 py-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
          reviewStatus === 'approved' ? 'bg-flag-safe-bg text-flag-safe' :
          reviewStatus === 'escalated' ? 'bg-flag-warning-bg text-flag-warning' :
          'bg-surface text-secondary'
        }`}>
          {reviewStatus === 'approved' && (
            <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          )}
          {reviewStatus === 'escalated' && (
            <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg>
          )}
          {displayLabel}
          {reviewedBy && (
            <span className="text-xs font-normal ml-1">by {reviewedBy}</span>
          )}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3" aria-busy={saving}>
      <button
        onClick={() => handleAction('approve')}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-flag-safe text-accent-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-flag-safe focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Approve
      </button>
      <button
        onClick={() => handleAction('escalate')}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border border-flag-warning text-flag-warning bg-background hover:bg-flag-warning-bg focus-visible:ring-2 focus-visible:ring-flag-warning focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
        </svg>
        Escalate
      </button>
      <button
        onClick={() => handleAction('override')}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-secondary hover:text-primary hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        aria-label="Override AI flag — use clinical judgment"
      >
        Override
      </button>
    </div>
  )
}
