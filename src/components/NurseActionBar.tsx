'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNurse } from '@/contexts/NurseContext'
import { insertAuditEntry } from '@/lib/audit'
import { ReviewStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
  const { nurse } = useNurse()
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(initialReviewStatus)
  const [reviewedBy, setReviewedBy] = useState<string | null>(initialReviewedBy)
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'approve' | 'escalate' | 'override' | 'under_review' | 'resolve') => {
    setLoading(true)

    const newStatus = ACTION_STATUS_MAP[action]
    const now = new Date().toISOString()

    try {
      const { error: updateError } = await supabase
        .from('notes')
        .update({
          review_status: newStatus,
          reviewed_by: nurse.name,
          reviewed_at: now,
        })
        .eq('id', noteId)

      if (updateError) {
        throw updateError
      }

      await insertAuditEntry({
        patientId,
        nurseName: nurse.name,
        actionType: `note_${action}`,
        metadata: { noteId, previousStatus: reviewStatus, newStatus },
      })

      setReviewStatus(newStatus)
      setReviewedBy(nurse.name)
      toast.success(TOAST_MESSAGES[action])
      onAction(action)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update note status'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (TERMINAL_STATES.includes(reviewStatus)) {
    const statusLabel = reviewStatus.charAt(0).toUpperCase() + reviewStatus.slice(1)
    const statusColorClass =
      reviewStatus === 'approved' || reviewStatus === 'resolved'
        ? 'text-flag-safe'
        : 'text-secondary'

    return (
      <div className={cn('flex items-center gap-2 py-2')}>
        <span className={cn('text-sm text-secondary italic')}>
          <span className={statusColorClass}>{statusLabel}</span> by {reviewedBy || nurse.name} &mdash; just now
        </span>
      </div>
    )
  }

  if (reviewStatus === 'escalated') {
    return (
      <div className={cn('flex items-center gap-3')}>
        <span className={cn('text-sm text-secondary italic')}>
          <span className="text-flag-warning">Escalated</span> by {reviewedBy || nurse.name} &mdash; just now
        </span>
        <Button
          variant="default"
          size="sm"
          onClick={() => handleAction('resolve')}
          disabled={loading}
          aria-label="Resolve flagged note"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Resolve
        </Button>
      </div>
    )
  }

  if (reviewStatus === 'under_review') {
    return (
      <div className={cn('flex items-center gap-3')}>
        <Button
          variant="default"
          size="sm"
          onClick={() => handleAction('resolve')}
          disabled={loading}
          aria-label="Resolve flagged note"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Resolve
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction('escalate')}
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
          </svg>
          Escalate
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3 flex-wrap')}>
      <Button
        variant="default"
        size="sm"
        onClick={() => handleAction('approve')}
        disabled={loading}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Approve
      </Button>
      {flagged && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('escalate')}
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
            Escalate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('override')}
            disabled={loading}
            aria-label="Override AI flag - use clinical judgment"
            className="text-muted hover:text-primary"
          >
            Override
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('under_review')}
            disabled={loading}
            aria-label="Mark note as under review"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Under Review
          </Button>
        </>
      )}
    </div>
  )
}
