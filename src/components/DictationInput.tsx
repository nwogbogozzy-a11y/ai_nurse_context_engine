'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { DEMO_SCRIPTS } from '@/lib/demo-scripts'
import { WebhookResponse } from '@/lib/types'
import { useNurse } from '@/contexts/NurseContext'
import { toast } from 'sonner'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SoapSkeleton } from '@/components/skeletons/SoapSkeleton'
import { TimeoutRetry } from '@/components/TimeoutRetry'
import { cn } from '@/lib/utils'

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
  const [showTimeout, setShowTimeout] = useState(false)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastInputRef = useRef<string>('')

  const isFreeForm = selectedScript === 'free-form'

  const availableScripts = Object.entries(DEMO_SCRIPTS).filter(([key]) =>
    key.startsWith(patientId)
  )

  const getScriptLabel = (key: string): string => {
    if (key.endsWith('_change')) return 'Vitals change (18:45)'
    if (key.endsWith('_alt')) return 'Follow-up observation'
    return 'Primary observation'
  }

  // 15-second timeout for processing state per D-16
  useEffect(() => {
    if (state === 'processing') {
      timeoutRef.current = setTimeout(() => {
        setShowTimeout(true)
      }, 15000)
    } else {
      setShowTimeout(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [state])

  const submitDictation = useCallback(async (rawInput: string) => {
    setState('processing')
    lastInputRef.current = rawInput

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/nurse-context'

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          raw_input: rawInput,
          nurse_name: nurse.name,
          shift: nurse.shift.toLowerCase(),
          input_type: 'note',
        }),
      })

      if (!response.ok) throw new Error(`Webhook returned ${response.status}`)

      const responseText = await response.text()
      let result: WebhookResponse
      try {
        result = responseText ? JSON.parse(responseText) : {}
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
  }, [patientId, nurse.name, nurse.shift, setIsDictating, onResult])

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
  }, [selectedScript, setIsDictating, submitDictation])

  const handleFreeFormSubmit = () => {
    if (!text.trim()) return
    setIsDictating(true)
    submitDictation(text)
  }

  const handleRetry = useCallback(() => {
    setShowTimeout(false)
    if (lastInputRef.current) {
      submitDictation(lastInputRef.current)
    }
  }, [submitDictation])

  const reset = () => {
    if (animationRef.current) clearInterval(animationRef.current)
    setIsDictating(false)
    setState('idle')
    setText('')
    setError(null)
  }

  return (
    <Card>
      <CardHeader className="px-5 py-3 pb-0">
        <label className="text-xs font-medium uppercase tracking-wide text-secondary">
          Clinical Dictation
        </label>
      </CardHeader>

      <CardContent className="px-5 py-4">
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
          <Textarea
            className={cn(
              'min-h-[120px] text-base leading-relaxed text-primary bg-background resize-none',
              state !== 'idle' && 'opacity-80'
            )}
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
          <div className="mt-4 space-y-3">
            <SoapSkeleton />
            {showTimeout && (
              <TimeoutRetry onRetry={handleRetry} />
            )}
          </div>
        )}

        {state === 'error' && (
          <div className="flex items-center gap-2 mt-3 p-3 bg-flag-critical-bg rounded-lg" role="alert">
            <svg className="w-4 h-4 text-flag-critical shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span className="text-sm text-flag-critical">{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setError(null); setState('idle') }}
              className="ml-auto border-flag-critical text-flag-critical hover:bg-flag-critical hover:text-accent-foreground"
            >
              Retry
            </Button>
          </div>
        )}

        {state === 'complete' && (
          <div className="flex items-center gap-2 mt-3">
            <svg className="w-4 h-4 text-flag-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span className="text-sm text-flag-safe">Note processed successfully</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted">Patient: {patientName} | Shift: {nurse.shift}</p>
          <div className="flex items-center gap-2">
            {(state === 'complete' || state === 'error') && (
              <Button variant="outline" onClick={reset}>
                New Dictation
              </Button>
            )}
            {state === 'idle' && !isFreeForm && (
              <Button
                onClick={startDictation}
                disabled={!DEMO_SCRIPTS[selectedScript]}
              >
                Begin Dictation
              </Button>
            )}
            {state === 'idle' && isFreeForm && (
              <Button
                onClick={handleFreeFormSubmit}
                disabled={!text.trim()}
              >
                Submit Note
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
