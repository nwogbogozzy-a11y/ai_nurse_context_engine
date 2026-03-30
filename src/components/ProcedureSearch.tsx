'use client'

import { useState } from 'react'
import { config } from '@/lib/config'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SupplySkeleton } from '@/components/skeletons/SupplySkeleton'
import { cn } from '@/lib/utils'

interface ProcedureSearchProps {
  patientId: string
  unitType: string
  onResult: () => void
}

type SearchState = 'idle' | 'loading' | 'success' | 'error'

export function ProcedureSearch({ patientId, unitType, onResult }: ProcedureSearchProps) {
  const [procedure, setProcedure] = useState('')
  const [state, setState] = useState<SearchState>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!procedure.trim()) return

    setState('loading')
    setError(null)

    const webhookUrl = config.n8nSupplyWebhookUrl

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          procedure: procedure.trim(),
          unit_type: unitType,
        }),
      })

      if (!response.ok) throw new Error(`Request failed (${response.status})`)

      const result = await response.json()
      if (!result.success) throw new Error('Supply lookup failed')

      setState('success')
      setProcedure('')
      onResult()

      // Reset to idle after brief success indication
      setTimeout(() => setState('idle'), 1500)
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Failed to look up supplies. Check that n8n is running.')
    }
  }

  const reset = () => {
    setState('idle')
    setError(null)
  }

  return (
    <Card>
      <CardHeader className={cn('px-5 py-3 pb-0')}>
        <span className={cn('text-xs font-medium uppercase tracking-wide text-secondary')}>
          Procedure Search
        </span>
      </CardHeader>

      <CardContent className={cn('px-5 py-4')}>
        <form onSubmit={handleSubmit}>
          <div className={cn('flex gap-2')}>
            <input
              type="text"
              value={procedure}
              onChange={(e) => {
                setProcedure(e.target.value)
                if (state === 'error') reset()
              }}
              placeholder="Search a procedure — e.g., chest tube insertion, admission, Foley catheter"
              disabled={state === 'loading'}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm text-primary bg-background border border-input rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                'disabled:bg-surface disabled:text-secondary placeholder:text-muted'
              )}
            />
            <Button
              type="submit"
              disabled={state === 'loading' || !procedure.trim()}
            >
              {state === 'loading' ? (
                <>
                  <div className={cn('w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin')} />
                  Looking up...
                </>
              ) : (
                'Get Supply List'
              )}
            </Button>
          </div>
        </form>

        {state === 'loading' && (
          <div className={cn('mt-4')}>
            <SupplySkeleton />
          </div>
        )}

        {state === 'success' && (
          <div className={cn('flex items-center gap-2 mt-3')}>
            <svg className={cn('w-4 h-4 text-flag-safe')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span className={cn('text-sm text-flag-safe')}>Supply list generated</span>
          </div>
        )}

        {state === 'error' && (
          <div className={cn('flex items-center gap-2 mt-3 p-3 bg-flag-critical-bg rounded-lg')}>
            <svg className={cn('w-4 h-4 text-flag-critical shrink-0')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span className={cn('text-sm text-flag-critical')}>{error}</span>
          </div>
        )}

        <p className={cn('text-xs text-muted mt-3')}>
          Look up supplies for any procedure — independent of note dictation.
        </p>
      </CardContent>
    </Card>
  )
}
