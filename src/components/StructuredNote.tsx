'use client'

import { Note, StructuredNote as StructuredNoteData } from '@/lib/types'
import { FlagBadge } from './FlagBadge'
import { NurseActionBar } from './NurseActionBar'

interface StructuredNoteProps {
  note: Note
}

export function StructuredNote({ note }: StructuredNoteProps) {
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
    { key: 'O', label: 'Objective', content: parsed?.objective },
    { key: 'A', label: 'Assessment', content: parsed?.assessment },
    { key: 'P', label: 'Plan', content: parsed?.plan },
  ]

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div>
          <h4 className="text-lg font-semibold text-primary">Structured Note</h4>
          <p className="text-xs text-muted mt-0.5">
            {note.nurse_name} | {formatTime(note.created_at)} | {note.shift} shift
          </p>
        </div>
        <FlagBadge type={flagType} />
      </div>

      <div className="px-5 py-4 space-y-3">
        {soapSections.map((section) => (
          <div key={section.key}>
            <span className="text-xs font-medium uppercase tracking-wide text-secondary">
              {section.label}
            </span>
            <p className="text-sm leading-relaxed text-primary mt-1">
              {section.content || '—'}
            </p>
          </div>
        ))}
      </div>

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

function formatTime(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
