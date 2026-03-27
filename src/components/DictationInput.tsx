'use client'

import { useState, useRef, useCallback } from 'react'
import { DEMO_SCRIPTS } from '@/lib/demo-scripts'
import { WebhookResponse } from '@/lib/types'
import { useNurse } from '@/contexts/NurseContext'
import { toast } from 'sonner'

interface DictationInputProps {
  patientId: string
  patientName: string
  onResult: (result: WebhookResponse) => void
}

type DictationState = 'idle' | 'animating' | 'processing' | 'complete' | 'error'

export function DictationInput({ patientId, patientName, onResult }: DictationInputProps) {
  const { nurse, setIsDictating } = useNurse()
  const [state, setState] = useState<DictationState>('idle')
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedScript, setSelectedScript] = useState<string>(patientId)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  const isFreeForm = selectedScript === 'free-form'

  const availableScripts = Object.entries(DEMO_SCRIPTS).filter(([key]) =>
    key.startsWith(patientId)
  )

  const getScriptLabel = (key: string): string => {
    if (key.endsWith('_change')) return 'Vitals change (18:45)'
    if (key.endsWith('_alt')) return 'Follow-up observation'
    return 'Primary observation'
  }

  const startDictation = useCallback(() => {
    const script = DEMO_SCRIPTS[selectedScript]
    if (!script) return

    setIsDictating(true)
    setState('animating')
    setText('')
    setError(null)
    let index = 0

    animationRef.current = setInterval(() => {
      if (index < script.length) {
        setText(script.slice(0, index + 1))
        index++
      } else {
        if (animationRef.current) clearInterval(animationRef.current)
        submitDictation(script)
      }
    }, 40)
  }, [selectedScript, patientId, setIsDictating])

  const submitDictation = async (rawInput: string) => {
    setState('processing')

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/nurse-context'

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          raw_input: rawInput,
          nurse_name: nurse.name,
          shift: nurse.shift,
          input_type: 'note',
        }),
      })

      if (!response.ok) throw new Error(`Webhook returned ${response.status}`)

      const text = await response.text()
      let result: WebhookResponse
      try {
        result = text ? JSON.parse(text) : {}
      } catch {
        throw new Error('Invalid response from n8n webhook — check workflow output')
      }
      setState('complete')
      setIsDictating(false)
      onResult(result)
    } catch (err) {
      setState('error')
      setIsDictating(false)
      const message = err instanceof Error ? err.message : 'Failed to process dictation'
      setError(message)
      toast.error('Failed to process dictation. Check that n8n is running.', { duration: 6000 })
    }
  }

  const handleFreeFormSubmit = () => {
    if (!text.trim()) return
    setIsDictating(true)
    submitDictation(text)
  }

  const reset = () => {
    if (animationRef.current) clearInterval(animationRef.current)
    setIsDictating(false)
    setState('idle')
    setText('')
    setError(null)
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <label className="text-xs font-medium uppercase tracking-wide text-secondary mb-3 block">
        Dictation Input
      </label>

      {state === 'idle' && (
        <div className="mb-3">
          <label className="text-xs font-medium uppercase tracking-wide text-secondary mb-1.5 block">
            Input Mode
          </label>
          <select
            value={selectedScript}
            onChange={(e) => {
              setSelectedScript(e.target.value)
              setText('')
            }}
            className="w-full px-3 py-2 text-sm text-primary bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Select input mode"
          >
            {availableScripts.map(([key]) => (
              <option key={key} value={key}>
                {getScriptLabel(key)}
              </option>
            ))}
            <option disabled>-----------</option>
            <option value="free-form">Free-form entry</option>
          </select>
        </div>
      )}

      <div className="relative">
        <textarea
          className="w-full min-h-[120px] p-4 text-base leading-relaxed text-primary bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-surface disabled:text-secondary"
          placeholder={isFreeForm ? 'Type your clinical observation...' : 'Select a script and begin dictation...'}
          value={text}
          onChange={(e) => {
            if (isFreeForm && state === 'idle') {
              setText(e.target.value)
            }
          }}
          disabled={isFreeForm ? state !== 'idle' : state === 'processing' || state === 'complete' || state === 'error'}
          readOnly={!isFreeForm}
          aria-busy={state === 'processing'}
        />
        {state === 'animating' && (
          <span className="absolute bottom-4 text-accent animate-blink text-lg" style={{ left: `${Math.min(text.length * 0.5 + 1, 95)}%` }}>|</span>
        )}
      </div>

      {state === 'processing' && (
        <div className="flex items-center gap-2 mt-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-secondary">Processing dictation...</span>
        </div>
      )}

      {state === 'error' && (
        <div className="flex items-center gap-2 mt-3 p-3 bg-flag-critical-bg rounded-lg" role="alert">
          <svg className="w-4 h-4 text-flag-critical shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span className="text-sm text-flag-critical">{error}</span>
          <button
            onClick={() => { setError(null); setState('idle') }}
            className="ml-auto px-3 py-1 text-sm font-medium rounded-lg border border-flag-critical text-flag-critical hover:bg-flag-critical hover:text-accent-foreground transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      )}

      {state === 'complete' && (
        <div className="flex items-center gap-2 mt-3">
          <svg className="w-4 h-4 text-flag-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span className="text-sm text-flag-safe">Note processed successfully</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-muted">Patient: {patientName} | Shift: {nurse.shift}</p>
        <div className="flex items-center gap-2">
          {(state === 'complete' || state === 'error') && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-secondary hover:text-primary hover:bg-background border border-border transition-colors duration-150"
            >
              New Dictation
            </button>
          )}
          {state === 'idle' && !isFreeForm && (
            <button
              onClick={startDictation}
              disabled={!DEMO_SCRIPTS[selectedScript]}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Begin Dictation
            </button>
          )}
          {state === 'idle' && isFreeForm && (
            <button
              onClick={handleFreeFormSubmit}
              disabled={!text.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Submit Note
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
