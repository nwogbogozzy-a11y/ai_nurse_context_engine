'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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

  const handleDictationResult = async (result: WebhookResponse) => {
    await fetchData()
    setActiveTab('notes')
    // Highlight the newest note (first in the list after fetch)
    const { data: latestNotes } = await supabase
      .from('notes')
      .select('id')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
    if (latestNotes?.[0]) {
      setHighlightedNoteId(latestNotes[0].id)
      setTimeout(() => setHighlightedNoteId(null), 2000)

      // Audit: create-note
      if (result.note) {
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
        await fetchData()
      }
    }
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

      // Safe parse — n8n may return empty body
      const text = await response.text()
      if (!text) throw new Error('n8n returned empty response — check workflow Respond to Webhook node')

      await fetchData()

      // Verify report was actually created in Supabase
      const { data: latestHandoff } = await supabase
        .from('handoff_reports')
        .select('id')
        .eq('patient_id', patientId)
        .order('generated_at', { ascending: false })
        .limit(1)

      if (!latestHandoff?.[0]) {
        throw new Error('Handoff report was not saved to database — check n8n workflow')
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
      await fetchData()
    } catch (err) {
      setHandoffError(err instanceof Error ? err.message : 'Failed to generate handoff report. Check that n8n is running.')
      toast.error('Failed to generate handoff report. Check that n8n is running.', { duration: 6000 })
    } finally {
      setGeneratingHandoff(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-border rounded w-1/3" />
          <div className="h-4 bg-border rounded w-1/4" />
          <div className="h-64 bg-border rounded" />
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-8">
        <p className="text-secondary">Patient not found.</p>
        <Link href="/" className="text-accent hover:text-accent-hover mt-2 inline-block">Back to Dashboard</Link>
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
    { key: 'activity' as Tab, label: 'Activity', count: auditEntries.length },
    { key: 'context' as Tab, label: 'Context', count: patientSummary ? 1 : 0 },
  ]

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6">
      {/* Back nav */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-secondary hover:text-primary transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-[280px_1fr_400px] gap-6">
        {/* Left sidebar — Patient Info */}
        <aside className="bg-surface border border-border rounded-lg p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-primary">{patient.full_name}</h3>
            <FlagBadge type={flagType} />
          </div>

          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-secondary">Ward</dt>
              <dd className="text-sm text-primary mt-0.5">{patient.ward}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-secondary">Unit Type</dt>
              <dd className="text-sm text-primary mt-0.5 capitalize">{patient.unit_type}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-secondary">Date of Birth</dt>
              <dd className="text-sm text-primary mt-0.5" suppressHydrationWarning>{new Date(patient.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-secondary">Admitted</dt>
              <dd className="text-sm text-primary mt-0.5" suppressHydrationWarning>{new Date(patient.admission_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-secondary">Current Status</dt>
              <dd className="text-sm text-primary mt-0.5 leading-relaxed">{patient.current_status}</dd>
            </div>
          </dl>

          <div className="mt-6 pt-4 border-t border-border">
            <button
              onClick={generateHandoffReport}
              disabled={generatingHandoff}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-accent text-accent bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {generatingHandoff ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  Generate Handoff Report
                </>
              )}
            </button>
            {handoffError && (
              <div className="mt-3 p-3 bg-flag-critical-bg rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-flag-critical shrink-0 mt-0.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  <p className="text-sm text-flag-critical">{handoffError}</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center — Tabbed content */}
        <div>
          <div className="flex items-center gap-1 mb-4 border-b border-border" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`panel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-accent text-accent'
                    : 'border-transparent text-secondary hover:text-primary'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.key ? 'bg-accent/10 text-accent' : 'bg-surface text-muted'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {activeTab === 'notes' && (
              notes.length === 0 ? (
                <div className="bg-surface border border-border rounded-lg p-8 text-center">
                  <p className="text-secondary">No notes yet. Use the dictation input to create the first note.</p>
                </div>
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
              )
            )}

            {activeTab === 'supplies' && (
              <>
                <ProcedureSearch
                  patientId={patientId}
                  unitType={patient.unit_type}
                  onResult={fetchData}
                />
                {supplies.length === 0 ? (
                  <div className="bg-surface border border-border rounded-lg p-8 text-center">
                    <p className="text-secondary">No supply requests yet. Search for a procedure above or dictate a note that mentions one.</p>
                  </div>
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
              </>
            )}

            {activeTab === 'handoff' && (
              handoffs.length === 0 ? (
                <div className="bg-surface border border-border rounded-lg p-8 text-center">
                  <p className="text-secondary">No handoff reports yet. Click &ldquo;Generate Handoff Report&rdquo; in the sidebar to create one.</p>
                </div>
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
              )
            )}

            {activeTab === 'activity' && (
              <ActivityTimeline entries={auditEntries} />
            )}

            {activeTab === 'context' && (
              <PatientContextSummary summary={patientSummary} loading={loading} />
            )}
          </div>
        </div>

        {/* Right panel — Dictation Input */}
        <div className="space-y-4">
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
