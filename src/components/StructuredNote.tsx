'use client'

import { useState } from 'react'
import { Note, StructuredNote as StructuredNoteData } from '@/lib/types'
import { FlagBadge } from './FlagBadge'
import { NurseActionBar } from './NurseActionBar'
import { formatNoteTimestamp, formatNoteLabel } from '@/lib/format-time'

interface StructuredNoteProps {
  note: Note
  noteNumber?: number
  procedures?: string[]
  hasSupplyList?: boolean
  onSupplyClick?: () => void
  isHighlighted?: boolean
}

export function StructuredNote({ note, noteNumber, procedures, hasSupplyList, onSupplyClick, isHighlighted }: StructuredNoteProps) {
  const [showRaw, setShowRaw] = useState(false)

  const flagType = note.flagged
    ? note.flag_reason?.toLowerCase().includes('critical') ? 'critical' : 'warning'
    : 'safe'

  // Supabase may return structured_note as a JSON string — parse if needed
  const parsed: StructuredNoteData | null = (() => {
    const sn = note.structured_note
    if (!sn) return null
    if (typeof sn === 'string') {
      try { return JSON.parse(sn) } catch { return null }
    }
    return sn
  })()

  const soapSections = [
    { key: 'S', label: 'Subjective', content: parsed?.subjective },
    { key: 'S-HPI', label: 'History of Present Illness', content: parsed?.history_of_present_illness, nested: true },
    { key: 'S-CM', label: 'Relevant Comorbidities', content: parsed?.comorbidities, nested: true },
    { key: 'O', label: 'Objective', content: parsed?.objective },
    { key: 'A', label: 'Assessment', content: parsed?.assessment },
    { key: 'A-I', label: 'Interventions (Prior Shift)', content: parsed?.interventions, nested: true },
    { key: 'P', label: 'Plan', content: parsed?.plan },
  ]

  // Generate time + procedure label
  const timeLabel = formatNoteLabel(note.created_at)
  const procedureLabel = procedures?.[0]
    ? procedures[0].charAt(0).toUpperCase() + procedures[0].slice(1)
    : 'Observation'
  const title = `${timeLabel} — ${procedureLabel}`

  return (
    <div className={`bg-surface border rounded-lg overflow-hidden transition-all duration-500 ${
      isHighlighted ? 'border-accent ring-2 ring-accent/20' : 'border-border'
    }`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div>
          <h4 className="text-lg font-semibold text-primary">{title}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            {noteNumber && (
              <span className="text-xs text-muted">Note #{noteNumber}</span>
            )}
            <span className="text-xs text-muted">
              {note.nurse_name} | {formatNoteTimestamp(note.created_at)} | {note.shift} shift
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasSupplyList && onSupplyClick && (
            <button
              onClick={onSupplyClick}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
              Supplies
            </button>
          )}
          <FlagBadge type={flagType} />
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {soapSections.map((section) => {
          if (section.nested && !section.content) return null
          return (
            <div key={section.key} className={section.nested ? 'pl-3 border-l-2 border-border' : ''}>
              <span className={`font-medium uppercase tracking-wide text-secondary ${section.nested ? 'text-[10px]' : 'text-xs'}`}>
                {section.label}
              </span>
              <p className="text-sm leading-relaxed text-primary mt-1">
                {section.content || '—'}
              </p>
            </div>
          )
        })}
      </div>

      {/* Procedure tags */}
      {procedures && procedures.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {procedures.map((proc) => (
            <span key={proc} className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent">
              {proc}
            </span>
          ))}
        </div>
      )}

      {/* Collapsible raw dictation */}
      {note.raw_input && (
        <div className="px-5 pb-3">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:text-primary transition-colors"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showRaw ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            Original Dictation
          </button>
          {showRaw && (
            <div className="mt-2 p-3 bg-background rounded-lg">
              <p className="text-sm italic text-secondary leading-relaxed">
                &ldquo;{note.raw_input}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {note.flagged && (
        <div className={`mx-5 mb-4 p-3 rounded-lg ${
          flagType === 'critical' ? 'bg-flag-critical-bg border border-flag-critical/20' : 'bg-flag-warning-bg border border-flag-warning/20'
        }`} role="alert">
          <div className="flex items-start gap-2">
            <svg className={`w-4 h-4 mt-0.5 shrink-0 ${flagType === 'critical' ? 'text-flag-critical' : 'text-flag-warning'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className={`text-sm ${flagType === 'critical' ? 'text-flag-critical' : 'text-flag-warning'}`}>
              {note.flag_reason}
            </p>
          </div>
        </div>
      )}

      {note.flagged && (
        <div className="px-5 py-3 border-t border-border bg-background">
          <NurseActionBar noteId={note.id} onAction={(action) => console.log(`Note ${note.id}: ${action}`)} />
        </div>
      )}
    </div>
  )
}
