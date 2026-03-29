'use client'

import { PriorityFlag } from '@/lib/types'
import { FlagBadge } from './FlagBadge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
        <Card>
          <CardHeader className="px-5 py-3 pb-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Summary</span>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <p className="text-sm leading-relaxed text-primary">{summary}</p>
          </CardContent>
        </Card>

        {/* Card 2 -- Priority Flags */}
        <Card>
          <CardHeader className="px-5 py-3 pb-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Priority Flags</span>
          </CardHeader>
          <CardContent className="px-5 py-4">
            {priorityFlags.length > 0 ? (
              <div className="space-y-2">
                {priorityFlags.map((flag, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg',
                      flag.type === 'critical' ? 'bg-flag-critical-bg' : 'bg-flag-warning-bg'
                    )}
                    role="alert"
                  >
                    <Badge variant={flag.type === 'critical' ? 'critical' : 'warning'}>
                      {flag.type}
                    </Badge>
                    <p className="text-sm text-primary">{flag.detail}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted italic">No priority flags for this handoff</p>
            )}
          </CardContent>
        </Card>

        {/* Card 3 -- Stable Items */}
        <Card>
          <CardHeader className="px-5 py-3 pb-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Stable Items</span>
          </CardHeader>
          <CardContent className="px-5 py-4">
            {stableItems.length > 0 ? (
              <ul className="space-y-2">
                {stableItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-flag-safe shrink-0" />
                    <span className="text-sm text-primary">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted italic">No stable items recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Card 4 -- Recommended First Actions */}
        <Card>
          <CardHeader className="px-5 py-3 pb-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Recommended First Actions</span>
          </CardHeader>
          <CardContent className="px-5 py-4">
            {recommendedFirstActions.length > 0 ? (
              <ol className="space-y-2">
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
              <p className="text-sm text-muted italic">No recommended actions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
