'use client'

import { PriorityFlag } from '@/lib/types'
import { FlagBadge } from './FlagBadge'

interface HandoffReportProps {
  patientName: string
  summary: string
  priorityFlags: PriorityFlag[]
  stableItems: string[]
  recommendedFirstActions: string[]
  generatedAt: string
  incomingShift: string
}

export function HandoffReport({
  patientName,
  summary,
  priorityFlags,
  stableItems,
  recommendedFirstActions,
  generatedAt,
  incomingShift,
}: HandoffReportProps) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-primary">Handoff Report</h4>
          <time className="text-xs text-muted">{generatedAt}</time>
        </div>
        <p className="text-sm text-secondary mt-1">{patientName} | Incoming: {incomingShift} shift</p>
      </div>

      <div className="px-5 py-4 border-b border-border">
        <span className="text-xs font-medium uppercase tracking-wide text-secondary">Summary</span>
        <p className="text-sm leading-relaxed text-primary mt-2">{summary}</p>
      </div>

      {priorityFlags.length > 0 && (
        <div className="px-5 py-4 border-b border-border">
          <span className="text-xs font-medium uppercase tracking-wide text-secondary">Priority Flags</span>
          <div className="mt-2 space-y-2">
            {priorityFlags.map((flag, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  flag.type === 'critical' ? 'bg-flag-critical-bg' : 'bg-flag-warning-bg'
                }`}
                role="alert"
              >
                <FlagBadge type={flag.type} />
                <p className="text-sm text-primary">{flag.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {stableItems.length > 0 && (
        <div className="px-5 py-4 border-b border-border">
          <span className="text-xs font-medium uppercase tracking-wide text-secondary">Stable Items</span>
          <ul className="mt-2 space-y-1">
            {stableItems.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-flag-safe shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendedFirstActions.length > 0 && (
        <div className="px-5 py-4">
          <span className="text-xs font-medium uppercase tracking-wide text-secondary">Recommended First Actions</span>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            {recommendedFirstActions.map((action, i) => (
              <li key={i} className="text-sm text-primary">{action}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
