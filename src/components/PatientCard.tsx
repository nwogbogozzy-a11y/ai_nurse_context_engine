'use client'

import Link from 'next/link'
import { Patient, Note } from '@/lib/types'
import { FlagBadge } from './FlagBadge'

interface PatientCardProps {
  patient: Patient
  latestNote?: Note | null
}

export function PatientCard({ patient, latestNote }: PatientCardProps) {
  const reviewStatus = latestNote?.review_status
  const hasCriticalFlag = latestNote?.flagged && latestNote.flag_reason?.toLowerCase().includes('critical')
  const hasWarningFlag = latestNote?.flagged && !hasCriticalFlag

  const flagType: 'safe' | 'warning' | 'critical' | 'under_review' | 'resolved' =
    reviewStatus === 'resolved' ? 'resolved'
    : reviewStatus === 'under_review' ? 'under_review'
    : reviewStatus === 'approved' || reviewStatus === 'overridden' ? 'safe'
    : reviewStatus === 'escalated' ? 'warning'
    : hasCriticalFlag ? 'critical'
    : hasWarningFlag ? 'warning'
    : 'safe'

  const borderClass =
    flagType === 'critical' ? 'border-l-4 border-l-flag-critical'
    : flagType === 'warning' ? 'border-l-4 border-l-flag-warning'
    : flagType === 'under_review' ? 'border-l-4 border-l-flag-review'
    : 'border-l-4 border-l-transparent'

  return (
    <Link
      href={`/patient/${patient.id}`}
      className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      aria-label={`${patient.full_name} — ${flagType === 'safe' ? 'stable' : flagType === 'resolved' ? 'resolved' : flagType === 'under_review' ? 'under review' : flagType + ' flag'}`}
    >
      <article
        className={`bg-surface border border-border ${borderClass} rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-150 cursor-pointer`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-semibold text-primary">{patient.full_name}</h4>
            <p className="text-sm text-secondary mt-1">
              {patient.ward} | {patient.unit_type} | Age {getAge(patient.date_of_birth)}
            </p>
          </div>
          <FlagBadge type={flagType} />
        </div>
        <p className="text-sm text-secondary mt-3 line-clamp-2">{patient.current_status}</p>
        <p className="text-xs text-muted mt-3">
          {latestNote
            ? `Last note: ${formatTimestamp(latestNote.created_at)}`
            : 'No notes yet'}
        </p>
      </article>
    </Link>
  )
}

function getAge(dob: string): string {
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
    age--
  }
  return `${age}`
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) +
    ' ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
