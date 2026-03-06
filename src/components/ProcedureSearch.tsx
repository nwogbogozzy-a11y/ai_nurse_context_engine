'use client'

import { useState } from 'react'

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

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL_SUPPLY || 'http://localhost:5678/webhook/supply-lookup'

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
    <div className="bg-surface border border-border rounded-lg p-5">
      <label className="text-xs font-medium uppercase tracking-wide text-secondary mb-3 block">
        Procedure Search
      </label>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            type="text"
            value={procedure}
            onChange={(e) => {
              setProcedure(e.target.value)
              if (state === 'error') reset()
            }}
            placeholder="Search a procedure — e.g., chest tube insertion, admission, Foley catheter"
            disabled={state === 'loading'}
            className="flex-1 px-4 py-2.5 text-sm text-primary bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-surface disabled:text-secondary placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={state === 'loading' || !procedure.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 whitespace-nowrap"
          >
            {state === 'loading' ? (
              <>
                <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                Looking up...
              </>
            ) : (
              'Get Supply List'
            )}
          </button>
        </div>
      </form>

      {state === 'success' && (
        <div className="flex items-center gap-2 mt-3">
          <svg className="w-4 h-4 text-flag-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span className="text-sm text-flag-safe">Supply list generated</span>
        </div>
      )}

      {state === 'error' && (
        <div className="flex items-center gap-2 mt-3 p-3 bg-flag-critical-bg rounded-lg">
          <svg className="w-4 h-4 text-flag-critical shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span className="text-sm text-flag-critical">{error}</span>
        </div>
      )}

      <p className="text-xs text-muted mt-3">
        Look up supplies for any procedure — independent of note dictation.
      </p>
    </div>
  )
}
