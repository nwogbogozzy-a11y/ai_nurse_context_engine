'use client'

import { useState } from 'react'
import { SupplyItem } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { insertAuditEntry } from '@/lib/audit'
import { useNurse } from '@/contexts/NurseContext'
import { toast } from 'sonner'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SupplyChecklistProps {
  supplyRequestId: string
  patientId: string
  procedure: string
  items: SupplyItem[]
  generatedAt: string
  initialConfirmedItems?: Record<number, boolean>
  onAuditChange?: () => void
  rationale?: string | null
}

export function SupplyChecklist({ supplyRequestId, patientId, procedure, items, generatedAt, initialConfirmedItems, onAuditChange, rationale }: SupplyChecklistProps) {
  const { nurse } = useNurse()
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>(initialConfirmedItems || {})
  const [allReady, setAllReady] = useState(false)
  const [showRationale, setShowRationale] = useState(false)

  const toggleItem = async (index: number) => {
    const prev = { ...confirmed }
    const wasConfirmed = confirmed[index]
    const newConfirmed = { ...confirmed, [index]: !confirmed[index] }
    setConfirmed(newConfirmed)

    const { error } = await supabase
      .from('supply_requests')
      .update({ confirmed_items: newConfirmed })
      .eq('id', supplyRequestId)

    if (error) {
      setConfirmed(prev)
      toast.error('Failed to save confirmation')
    } else if (!wasConfirmed) {
      toast.success('Item confirmed')
    }
  }

  const markAllReady = async () => {
    const prev = { ...confirmed }
    const all: Record<number, boolean> = {}
    items.forEach((_, i) => { all[i] = true })
    setConfirmed(all)
    setAllReady(true)

    const { error } = await supabase
      .from('supply_requests')
      .update({ confirmed_items: all })
      .eq('id', supplyRequestId)

    if (error) {
      setConfirmed(prev)
      setAllReady(false)
      toast.error('Failed to save confirmation')
    } else {
      toast.success('All supplies marked ready', { duration: 4000 })
      await insertAuditEntry({
        patientId,
        nurseName: nurse.name,
        actionType: 'confirm-supply',
        metadata: {
          supply_request_id: supplyRequestId,
          items_confirmed: items.length,
        },
      })
      onAuditChange?.()
    }
  }

  const allConfirmed = items.every((_, i) => confirmed[i])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-5 py-3 border-b border-border space-y-1">
        <h4 className="text-lg font-semibold text-primary">Procedure Prep Recommendations</h4>
        <p className="text-xs text-muted">{procedure} | Generated: {generatedAt}</p>
        {rationale && (
          <p className="text-xs text-muted">AI suggested based on {procedure}</p>
        )}
      </CardHeader>

      {rationale && (
        <div className="px-5 py-2 border-b border-border">
          <button
            onClick={() => setShowRationale(!showRationale)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
            aria-expanded={showRationale}
            aria-controls="supply-rationale"
          >
            <svg className={cn('w-3 h-3 transition-transform duration-150', showRationale && 'rotate-90')} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            {showRationale ? 'Hide Rationale' : 'View Rationale'}
          </button>
          {showRationale && (
            <div id="supply-rationale" role="region" className="mt-2 p-4 bg-background rounded-lg">
              <p className="text-sm leading-relaxed text-secondary italic">
                {rationale}
              </p>
            </div>
          )}
        </div>
      )}

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 text-xs font-medium uppercase tracking-wide text-secondary">Item</TableHead>
              <TableHead className="px-3 text-xs font-medium uppercase tracking-wide text-secondary">Qty</TableHead>
              <TableHead className="px-3 text-xs font-medium uppercase tracking-wide text-secondary">Unit</TableHead>
              <TableHead className="px-3 text-xs font-medium uppercase tracking-wide text-secondary">Notes</TableHead>
              <TableHead className="px-3 text-center text-xs font-medium uppercase tracking-wide text-secondary">
                <span className="sr-only">Confirm</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="px-5 text-sm text-primary">{item.item}</TableCell>
                <TableCell className="px-3 text-sm font-mono text-primary">{item.quantity}</TableCell>
                <TableCell className="px-3 text-sm text-secondary">{item.unit}</TableCell>
                <TableCell className="px-3 text-sm text-muted">{item.notes || '\u2014'}</TableCell>
                <TableCell className="px-3 text-center">
                  <Checkbox
                    checked={!!confirmed[i]}
                    onCheckedChange={() => toggleItem(i)}
                    aria-label={`${confirmed[i] ? 'Uncheck' : 'Confirm'} ${item.item}`}
                    className={cn(
                      'h-5 w-5',
                      confirmed[i] && 'data-[state=checked]:bg-flag-safe data-[state=checked]:border-flag-safe'
                    )}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="px-5 py-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted">
          {Object.values(confirmed).filter(Boolean).length} of {items.length} confirmed
        </span>
        {allReady || allConfirmed ? (
          <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-flag-safe-bg text-flag-safe">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            All Ready
          </span>
        ) : (
          <Button onClick={markAllReady}>
            Mark All Ready
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
