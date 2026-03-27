'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ReviewStatus } from '@/lib/types'

interface NurseActionBarProps {
  noteId: string
  patientId: string
  initialReviewStatus?: ReviewStatus
  initialReviewedBy?: string | null
  flagged?: boolean
  onAction: (action: 'approve' | 'escalate' | 'override' | 'under_review' | 'resolve') => void
}

const ACTION_STATUS_MAP: Record<string, ReviewStatus> = {
  approve: 'approved',
  escalate: 'escalated',
  override: 'overridden',
  under_review: 'under_review',
  resolve: 'resolved',
}

const TOAST_MESSAGES: Record<string, string> = {
  approve: 'Note approved',
  escalate: 'Note escalated',
  override: 'Note overridden',
  under_review: 'Note marked as under review',
  resolve: 'Note resolved',
}

const TERMINAL_STATES: ReviewStatus[] = ['approved', 'overridden', 'resolved']

export function NurseActionBar({
  noteId,
  patientId,
  initialReviewStatus = 'pending',
  initialReviewedBy = null,
  flagged = false,
  onAction,
}: NurseActionBarProps) {
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(initialReviewStatus)
  const [reviewedBy, setReviewedBy] = useState<string | null>(initialReviewedBy)
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const nurseName = 'Sarah Chen'

  const handleAction = async (action: 'approve' | 'escalate' | 'override' | 'under_review' | 'resolve') => {
    setLoading(true)
    setError(null)

    const newStatus = ACTION_STATUS_MAP[action]
    const now = new Date().toISOString()

    try {
      const { error: updateError } = await supabase
        .from('notes')
        .update({
          review_status: newStatus,
          reviewed_by: nurseName,
          reviewed_at: now,
        })
        .eq('id', noteId)

      if (updateError) {
        throw updateError
      }

      setReviewStatus(newStatus)
      setReviewedBy(nurseName)
      setToastMessage(TOAST_MESSAGES[action])
      onAction(action)

      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update note status'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Terminal states show status text instead of buttons
  if (TERMINAL_STATES.includes(reviewStatus)) {
    const statusLabel = reviewStatus.charAt(0).toUpperCase() + reviewStatus.slice(1)
    const statusColorClass =
      reviewStatus === 'approved' ? 'text-flag-safe' :
      reviewStatus === 'resolved' ? 'text-flag-safe' :
      'text-secondary'

    return (
      <div className="flex items-center gap-2 py-2">
        <span className="text-sm text-secondary italic">
          <span className={statusColorClass}>{statusLabel}</span> by {reviewedBy || nurseName} &mdash; just now
        </span>
        {toastMessage && (
          <span className="text-xs text-flag-safe font-medium" role="status">{toastMessage}</span>
        )}
      </div>
    )
  }

  // Escalated state: only Resolve button
  if (reviewStatus === 'escalated') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-secondary italic">
          <span className="text-flag-warning">Escalated</span> by {reviewedBy || nurseName} &mdash; just now
        </span>
        <button
          onClick={() => handleAction('resolve')}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-flag-safe-bg text-flag-safe hover:bg-flag-safe-hover border border-flag-safe/20 focus-visible:ring-2 focus-visible:ring-flag-safe focus-visible:ring-offset-2 transition-colors duration-150 disabled:opacity-50"
          aria-label="Resolve flagged note"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Resolve
        </button>
        {toastMessage && (
          <span className="text-xs text-flag-safe font-medium" role="status">{toastMessage}</span>
        )}
        {error && (
          <span className="text-xs text-flag-critical font-medium" role="alert">{error}</span>
        )}
      </div>
    )
  }

  // Under review state: Resolve and Escalate buttons
  if (reviewStatus === 'under_review') {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleAction('resolve')}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-flag-safe-bg text-flag-safe hover:bg-flag-safe-hover border border-flag-safe/20 focus-visible:ring-2 focus-visible:ring-flag-safe focus-visible:ring-offset-2 transition-colors duration-150 disabled:opacity-50"
          aria-label="Resolve flagged note"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Resolve
        </button>
        <button
          onClick={() => handleAction('escalate')}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-flag-warning text-flag-warning bg-background hover:bg-flag-warning-bg focus-visible:ring-2 focus-visible:ring-flag-warning focus-visible:ring-offset-2 transition-colors duration-150 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
          </svg>
          Escalate
        </button>
        {toastMessage && (
          <span className="text-xs text-flag-safe font-medium" role="status">{toastMessage}</span>
        )}
        {error && (
          <span className="text-xs text-flag-critical font-medium" role="alert">{error}</span>
        )}
      </div>
    )
  }

  // Pending state: buttons depend on whether note is flagged
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={() => handleAction('approve')}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-flag-safe text-accent-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-flag-safe focus-visible:ring-offset-2 transition-colors duration-150 disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Approve
      </button>
      {flagged && (
        <>
          <button
            onClick={() => handleAction('escalate')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border border-flag-warning text-flag-warning bg-background hover:bg-flag-warning-bg focus-visible:ring-2 focus-visible:ring-flag-warning focus-visible:ring-offset-2 transition-colors duration-150 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
            Escalate
          </button>
          <button
            onClick={() => handleAction('override')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-secondary hover:text-primary hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors duration-150 disabled:opacity-50"
            aria-label="Override AI flag — use clinical judgment"
          >
            Override
          </button>
          <button
            onClick={() => handleAction('under_review')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-flag-review-bg text-flag-review hover:bg-flag-review-hover border border-flag-review/20 focus-visible:ring-2 focus-visible:ring-flag-review focus-visible:ring-offset-2 transition-colors duration-150 disabled:opacity-50"
            aria-label="Mark note as under review"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Under Review
          </button>
        </>
      )}
      {toastMessage && (
        <span className="text-xs text-flag-safe font-medium" role="status">{toastMessage}</span>
      )}
      {error && (
        <span className="text-xs text-flag-critical font-medium" role="alert">{error}</span>
      )}
    </div>
  )
}
