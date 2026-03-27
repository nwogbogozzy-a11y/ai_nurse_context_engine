'use client'

import { useState } from 'react'
import { SupplyItem } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface SupplyChecklistProps {
  supplyRequestId: string
  procedure: string
  items: SupplyItem[]
  generatedAt: string
  initialConfirmedItems?: Record<number, boolean>
}

export function SupplyChecklist({ supplyRequestId, procedure, items, generatedAt, initialConfirmedItems }: SupplyChecklistProps) {
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>(initialConfirmedItems || {})
  const [allReady, setAllReady] = useState(false)

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
      toast.success('All supplies marked ready')
    }
  }

  const allConfirmed = items.every((_, i) => confirmed[i])

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h4 className="text-lg font-semibold text-primary">Supply Checklist</h4>
        <p className="text-xs text-muted mt-0.5">{procedure} | Generated: {generatedAt}</p>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-5 py-2 text-left text-xs font-medium uppercase tracking-wide text-secondary">Item</th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-secondary">Qty</th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-secondary">Unit</th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-secondary">Notes</th>
            <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-secondary">
              <span className="sr-only">Confirm</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-border last:border-b-0">
              <td className="px-5 py-3 text-sm text-primary">{item.item}</td>
              <td className="px-3 py-3 text-sm font-mono text-primary">{item.quantity}</td>
              <td className="px-3 py-3 text-sm text-secondary">{item.unit}</td>
              <td className="px-3 py-3 text-sm text-muted">{item.notes || '—'}</td>
              <td className="px-3 py-3 text-center">
                <button
                  onClick={() => toggleItem(i)}
                  className={`w-6 h-6 rounded border flex items-center justify-center transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent ${
                    confirmed[i]
                      ? 'bg-flag-safe border-flag-safe text-accent-foreground'
                      : 'border-border bg-background hover:border-accent'
                  }`}
                  aria-label={`${confirmed[i] ? 'Uncheck' : 'Confirm'} ${item.item}`}
                  aria-checked={!!confirmed[i]}
                  role="checkbox"
                >
                  {confirmed[i] && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted">
          {Object.values(confirmed).filter(Boolean).length} of {items.length} confirmed
        </span>
        {allReady || allConfirmed ? (
          <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-flag-safe-bg text-flag-safe">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            All Ready
          </span>
        ) : (
          <button
            onClick={markAllReady}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors duration-150"
          >
            Mark All Ready
          </button>
        )}
      </div>
    </div>
  )
}
