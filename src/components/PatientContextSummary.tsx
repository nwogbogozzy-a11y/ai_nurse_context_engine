'use client'

import { PatientSummary } from '@/lib/types'
import { formatNoteTimestamp } from '@/lib/format-time'

interface PatientContextSummaryProps {
  summary: PatientSummary | null
  loading?: boolean
}

export function PatientContextSummary({ summary, loading }: PatientContextSummaryProps) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-5 animate-pulse">
        <p className="text-sm text-muted">Loading patient context...</p>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="bg-surface border border-border rounded-lg p-5">
        <h3 className="text-lg font-semibold text-primary">Patient Context</h3>
        <div className="mt-4 text-center py-8">
          <p className="text-sm font-semibold text-primary">No context available yet</p>
          <p className="text-sm text-muted mt-2">
            Submit a clinical note to generate the patient context summary. The AI builds context from documented observations.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-5" role="status">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Patient Context</h3>
          <p className="text-xs font-semibold text-muted mt-1">
            AI-generated from last {summary.note_count} notes
          </p>
        </div>
        <span className="text-xs text-muted">
          Updated {formatNoteTimestamp(summary.generated_at)}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-primary mt-4">
        {summary.summary}
      </p>
    </div>
  )
}
