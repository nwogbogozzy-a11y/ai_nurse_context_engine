'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Patient, Note, SupplyRequest, HandoffReport as HandoffReportType, WebhookResponse, AuditLogEntry, PatientSummary } from '@/lib/types'
import { FlagBadge } from '@/components/FlagBadge'
import { DictationInput } from '@/components/DictationInput'
import { StructuredNote } from '@/components/StructuredNote'
import { SupplyChecklist } from '@/components/SupplyChecklist'
import { ProcedureSearch } from '@/components/ProcedureSearch'
import { HandoffReport } from '@/components/HandoffReport'
import { ActivityTimeline } from '@/components/ActivityTimeline'
import { PatientContextSummary } from '@/components/PatientContextSummary'
import { useNurse } from '@/contexts/NurseContext'
import { insertAuditEntry } from '@/lib/audit'
import { toast } from 'sonner'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { HandoffSkeleton } from '@/components/skeletons/HandoffSkeleton'
import { cn } from '@/lib/utils'

type Tab = 'notes' | 'supplies' | 'handoff' | 'activity' | 'context'

export default function PatientDetail() {
  const params = useParams()
  const patientId = params.id as string
  const { nurse } = useNurse()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [supplies, setSupplies] = useState<SupplyRequest[]>([])
  const [handoffs, setHandoffs] = useState<HandoffReportType[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('notes')
  const [loading, setLoading] = useState(true)
  const [generatingHandoff, setGeneratingHandoff] = useState(false)
  const [handoffError, setHandoffError] = useState<string | null>(null)
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null)
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([])
  const [patientSummary, setPatientSummary] = useState<PatientSummary | null>(null)

  // Ref for pending highlight from dictation submission
  const pendingHighlightRef = useRef(false)

  // Correlate notes to supply_requests by timestamp proximity (within 120s)
  const noteProcedures = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const note of notes) {
      const noteTime = new Date(note.created_at).getTime()
      for (const supply of supplies) {
        const supplyTime = new Date(supply.generated_at).getTime()
        if (Math.abs(noteTime - supplyTime) <= 120000) {
          if (!map[note.id]) map[note.id] = []
          if (!map[note.id].includes(supply.procedure)) {
            map[note.id].push(supply.procedure)
          }
        }
      }
    }
    return map
  }, [notes, supplies])

  const fetchData = useCallback(async () => {
    const [patientRes, notesRes, suppliesRes, handoffsRes, auditRes, summaryRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', patientId).single(),
      supabase.from('notes').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('supply_requests').select('*').eq('patient_id', patientId).order('generated_at', { ascending: false }),
      supabase.from('handoff_reports').select('*').eq('patient_id', patientId).order('generated_at', { ascending: false }),
      supabase.from('audit_log').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('patient_summaries').select('*').eq('patient_id', patientId).order('generated_at', { ascending: false }).limit(1).single(),
    ])

    if (patientRes.data) setPatient(patientRes.data)
    if (notesRes.data) setNotes(notesRes.data)
    if (suppliesRes.data) setSupplies(suppliesRes.data)
    if (handoffsRes.data) setHandoffs(handoffsRes.data)
    if (auditRes.data) setAuditEntries(auditRes.data)
    if (summaryRes.data) setPatientSummary(summaryRes.data)
    setLoading(false)
  }, [patientId])

  useEffect(() => { fetchData() }, [fetchData])

  // D-03/D-04/D-05: Per-patient realtime subscriptions
  const handleNoteInsert = useCallback((note: Note) => {
    // D-05: prepend to top of list, no full refetch
    setNotes((prev) => [note, ...prev])
    // If a dictation was just submitted, highlight this new note
    if (pendingHighlightRef.current) {
      pendingHighlightRef.current = false
      setHighlightedNoteId(note.id)
      setTimeout(() => setHighlightedNoteId(null), 2000)
    }
  }, [])

  const handleNoteUpdate = useCallback((note: Note) => {
    // Replace updated note in list (review_status changes)
    setNotes((prev) => prev.map((n) => n.id === note.id ? note : n))
  }, [])

  const handleSupplyInsert = useCallback((supply: SupplyRequest) => {
    setSupplies((prev) => [supply, ...prev])
  }, [])

  const handleHandoffInsert = useCallback((handoff: HandoffReportType) => {
    setHandoffs((prev) => [handoff, ...prev])
  }, [])

  const handleAuditInsert = useCallback((entry: AuditLogEntry) => {
    setAuditEntries((prev) => [entry, ...prev])
  }, [])

  useRealtimeSubscription({
    patientId,
    onNoteInsert: handleNoteInsert,
    onNoteUpdate: handleNoteUpdate,
    onSupplyInsert: handleSupplyInsert,
    onHandoffInsert: handleHandoffInsert,
    onAuditInsert: handleAuditInsert,
  })

  const handleDictationResult = async (result: WebhookResponse) => {
    // Set pending highlight so the realtime insert callback highlights the note
    pendingHighlightRef.current = true
    setActiveTab('notes')

    // Audit: create-note
    if (result.note) {
      // Fetch latest note ID for audit metadata
      const { data: latestNotes } = await supabase
        .from('notes')
        .select('id')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (latestNotes?.[0]) {
        await insertAuditEntry({
          patientId,
          nurseName: nurse.name,
          actionType: 'create-note',
          metadata: {
            note_id: latestNotes[0].id,
            flagged: result.note.flagged,
            procedures: result.note.procedures,
          },
        })
      }
    }

    // D-06: refetch patient_summaries on navigate (not via realtime) - trigger refetch
    const { data: summaryData } = await supabase
      .from('patient_summaries')
      .select('*')
      .eq('patient_id', patientId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single()
    if (summaryData) setPatientSummary(summaryData)
  }

  const generateHandoffReport = async () => {
    if (!patient) return
    setGeneratingHandoff(true)
    setHandoffError(null)

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/nurse-context'

    try {
      const lastNote = notes[0]
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          raw_input: lastNote?.raw_input || patient.current_status,
          nurse_name: nurse.name,
          shift: nurse.shift.toLowerCase(),
          input_type: 'handoff',
        }),
      })

      if (!response.ok) throw new Error('Failed to generate handoff report')

      // Safe parse -- n8n may return empty body
      const text = await response.text()
      if (!text) throw new Error('n8n returned empty response -- check workflow Respond to Webhook node')

      // Realtime will handle the new handoff appearing in the list
      // But verify it was saved
      const { data: latestHandoff } = await supabase
        .from('handoff_reports')
        .select('id')
        .eq('patient_id', patientId)
        .order('generated_at', { ascending: false })
        .limit(1)

      if (!latestHandoff?.[0]) {
        throw new Error('Handoff report was not saved to database -- check n8n workflow')
      }

      setActiveTab('handoff')
      toast.success('Handoff report generated', { duration: 4000 })

      // Audit: generate-handoff
      await insertAuditEntry({
        patientId,
        nurseName: nurse.name,
        actionType: 'generate-handoff',
        metadata: {
          handoff_report_id: latestHandoff[0].id,
          shift: nurse.shift,
        },
      })
    } catch (err) {
      setHandoffError(err instanceof Error ? err.message : 'Failed to generate handoff report. Check that n8n is running.')
      toast.error('Failed to generate handoff report. Check that n8n is running.', { duration: 6000 })
    } finally {
      setGeneratingHandoff(false)
    }
  }

  if (loading) {
    return (
      <div className={cn('max-w-[1600px] mx-auto px-12 py-6')}>
        <Skeleton className="h-5 w-40 mb-6" />
        <div className={cn('grid grid-cols-[280px_1fr_400px] gap-6')}>
          <Card className={cn('p-6 space-y-4')}>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </Card>
          <div className={cn('space-y-4')}>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className={cn('space-y-4')}>
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className={cn('max-w-[1600px] mx-auto px-12 py-6')}>
        <p className={cn('text-secondary')}>Patient not found.</p>
        <Button variant="ghost" asChild className={cn('mt-2')}>
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  const latestNote = notes[0]
  const hasCriticalFlag = latestNote?.flagged && latestNote.flag_reason?.toLowerCase().includes('critical')
  const hasWarningFlag = latestNote?.flagged && !hasCriticalFlag
  const flagType = hasCriticalFlag ? 'critical' : hasWarningFlag ? 'warning' : 'safe'

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'notes', label: 'Notes', count: notes.length },
    { key: 'supplies', label: 'Supply Requests', count: supplies.length },
    { key: 'handoff', label: 'Handoff Report', count: handoffs.length },
    { key: 'activity', label: 'Activity', count: auditEntries.length },
    { key: 'context', label: 'Context', count: patientSummary ? 1 : 0 },
  ]

  return (
    <div className={cn('max-w-[1600px] mx-auto px-12 py-6')}>
      {/* Back nav */}
      <Button variant="ghost" asChild className={cn('mb-6 -ml-2 text-secondary hover:text-primary')}>
        <Link href="/" className={cn('inline-flex items-center gap-1 text-sm')}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </Link>
      </Button>

      <div className={cn('grid grid-cols-[280px_1fr_400px] gap-6')}>
        {/* Left sidebar -- Patient Info */}
        <aside className={cn('border-r border-border pr-6 h-fit')}>
          <Card className={cn('p-6')}>
            <div className={cn('flex items-center justify-between mb-4')}>
              <h3 className={cn('text-xl font-semibold text-primary')}>{patient.full_name}</h3>
              <FlagBadge type={flagType} />
            </div>

            <dl className={cn('space-y-3')}>
              <div>
                <dt className={cn('text-xs font-medium uppercase tracking-wide text-secondary')}>Ward</dt>
                <dd className={cn('text-sm text-primary mt-0.5')}>{patient.ward}</dd>
              </div>
              <div>
                <dt className={cn('text-xs font-medium uppercase tracking-wide text-secondary')}>Unit Type</dt>
                <dd className={cn('text-sm text-primary mt-0.5 capitalize')}>{patient.unit_type}</dd>
              </div>
              <div>
                <dt className={cn('text-xs font-medium uppercase tracking-wide text-secondary')}>Date of Birth</dt>
                <dd className={cn('text-sm text-primary mt-0.5')} suppressHydrationWarning>{new Date(patient.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
              </div>
              <div>
                <dt className={cn('text-xs font-medium uppercase tracking-wide text-secondary')}>Admitted</dt>
                <dd className={cn('text-sm text-primary mt-0.5')} suppressHydrationWarning>{new Date(patient.admission_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
              </div>
              <div>
                <dt className={cn('text-xs font-medium uppercase tracking-wide text-secondary')}>Current Status</dt>
                <dd className={cn('text-sm text-primary mt-0.5 leading-relaxed')}>{patient.current_status}</dd>
              </div>
            </dl>
          </Card>

          <div className={cn('mt-6')}>
            <Button
              variant="outline"
              onClick={generateHandoffReport}
              disabled={generatingHandoff}
              className={cn('w-full')}
            >
              {generatingHandoff ? (
                <>
                  <div className={cn('w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin')} />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  Generate Handoff Report
                </>
              )}
            </Button>
            {handoffError && (
              <div className={cn('mt-3 p-3 bg-flag-critical-bg rounded-lg')}>
                <div className={cn('flex items-start gap-2')}>
                  <svg className="w-4 h-4 text-flag-critical shrink-0 mt-0.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  <p className={cn('text-sm text-flag-critical')}>{handoffError}</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center -- Tabbed content */}
        <div className={cn('px-2')}>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)} className={cn('flex-1')}>
            <TabsList className={cn('w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 gap-0')}>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className={cn(
                    'rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium transition-colors',
                    'data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                    'data-[state=inactive]:text-secondary hover:text-primary'
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={cn(
                      'ml-1.5 px-1.5 py-0.5 text-xs rounded-full',
                      'bg-surface text-muted'
                    )}>
                      {tab.count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="notes" className={cn('mt-4 space-y-4')}>
              {notes.length === 0 ? (
                <Card className={cn('text-center py-12')}>
                  <p className={cn('text-sm font-medium text-primary mb-1')}>No notes recorded</p>
                  <p className={cn('text-sm text-secondary')}>Use the dictation panel to record your first observation for this patient.</p>
                </Card>
              ) : (
                notes.map((note, index) => (
                  <StructuredNote
                    key={note.id}
                    note={note}
                    noteNumber={notes.length - index}
                    procedures={noteProcedures[note.id]}
                    hasSupplyList={!!noteProcedures[note.id]?.length}
                    onSupplyClick={() => setActiveTab('supplies')}
                    isHighlighted={highlightedNoteId === note.id}
                    onAction={fetchData}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="supplies" className={cn('mt-4 space-y-4')}>
              <ProcedureSearch
                patientId={patientId}
                unitType={patient.unit_type}
                onResult={fetchData}
              />
              {supplies.length === 0 ? (
                <Card className={cn('text-center py-12')}>
                  <p className={cn('text-sm font-medium text-primary mb-1')}>No supply requests</p>
                  <p className={cn('text-sm text-secondary')}>Supply lists are generated automatically when a procedure is mentioned in a note.</p>
                </Card>
              ) : (
                supplies.map((supply) => (
                  <SupplyChecklist
                    key={supply.id}
                    supplyRequestId={supply.id}
                    patientId={patientId}
                    procedure={supply.procedure}
                    items={supply.items}
                    generatedAt={new Date(supply.generated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    initialConfirmedItems={supply.confirmed_items || {}}
                    onAuditChange={fetchData}
                    rationale={supply.rationale}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="handoff" className={cn('mt-4 space-y-4')}>
              {generatingHandoff && <HandoffSkeleton />}
              {!generatingHandoff && handoffs.length === 0 ? (
                <Card className={cn('text-center py-12')}>
                  <p className={cn('text-sm font-medium text-primary mb-1')}>No handoff report</p>
                  <p className={cn('text-sm text-secondary')}>Generate a handoff report to brief the incoming nurse on this patient&apos;s current state.</p>
                </Card>
              ) : (
                handoffs.map((report) => (
                  <HandoffReport
                    key={report.id}
                    patientName={patient.full_name}
                    summary={report.summary}
                    priorityFlags={report.flags || []}
                    stableItems={report.stable_items || []}
                    recommendedFirstActions={report.recommended_first_actions || []}
                    generatedAt={new Date(report.generated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(report.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    incomingShift={nurse.shift === 'Night' ? 'Morning' : 'Night'}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="activity" className={cn('mt-4 space-y-4')}>
              <ActivityTimeline entries={auditEntries} />
            </TabsContent>

            <TabsContent value="context" className={cn('mt-4 space-y-4')}>
              <PatientContextSummary summary={patientSummary} loading={loading} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right panel -- Dictation Input */}
        <div className={cn('border-l border-border pl-6 space-y-4')}>
          <DictationInput
            patientId={patientId}
            patientName={patient.full_name}
            onResult={handleDictationResult}
          />
        </div>
      </div>
    </div>
  )
}
