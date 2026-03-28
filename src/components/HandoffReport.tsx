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
    <div>
      {/* Report header */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-primary">Shift Handoff Report</h4>
        <p className="text-sm text-secondary mt-1">{patientName} | Incoming: {incomingShift} shift</p>
        <time className="text-xs text-muted">{generatedAt}</time>
      </div>

      {/* Card stack */}
      <div className="space-y-4">
        {/* Card 1 -- Summary */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Summary</span>
          <p className="text-base leading-relaxed text-primary mt-3">{summary}</p>
        </div>

        {/* Card 2 -- Priority Flags */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Priority Flags</span>
          {priorityFlags.length > 0 ? (
            <div className="mt-3 space-y-2">
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
          ) : (
            <p className="text-sm text-muted italic mt-3">No priority flags for this handoff</p>
          )}
        </div>

        {/* Card 3 -- Stable Items */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Stable Items</span>
          {stableItems.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {stableItems.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-flag-safe shrink-0" />
                  <span className="text-sm text-primary">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted italic mt-3">No stable items recorded</p>
          )}
        </div>

        {/* Card 4 -- Recommended First Actions */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Recommended First Actions</span>
          {recommendedFirstActions.length > 0 ? (
            <ol className="mt-3 space-y-2">
              {recommendedFirstActions.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-accent w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-primary">{action}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted italic mt-3">No recommended actions</p>
          )}
        </div>
      </div>
    </div>
  )
}
