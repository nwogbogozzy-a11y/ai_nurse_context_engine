'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Patient, Note } from '@/lib/types'
import { FlagBadge } from './FlagBadge'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PatientCardProps {
  patient: Patient
  latestNote?: Note | null
  unresolvedFlagCount?: number
}

export function PatientCard({ patient, latestNote, unresolvedFlagCount = 0 }: PatientCardProps) {
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

  const admissionDays = useMemo(() => {
    return Math.ceil(
      (new Date().getTime() - new Date(patient.admission_date).getTime()) / 86400000
    )
  }, [patient.admission_date])

  return (
    <Link
      href={`/patient/${patient.id}`}
      className={cn(
        'block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
      )}
      aria-label={`${patient.full_name} — ${flagType === 'safe' ? 'stable' : flagType === 'resolved' ? 'resolved' : flagType === 'under_review' ? 'under review' : flagType + ' flag'}`}
    >
      <Card
        className={cn(
          borderClass,
          'p-6 hover:shadow-md transition-shadow duration-150 cursor-pointer'
        )}
      >
        <CardHeader className={cn('p-0 pb-3 flex flex-row items-center justify-between space-y-0')}>
          <h4 className={cn('text-lg font-semibold text-primary')}>{patient.full_name}</h4>
          <FlagBadge type={flagType} />
        </CardHeader>

        <CardContent className={cn('p-0 space-y-2')}>
          <p className={cn('text-sm text-secondary')}>
            {patient.ward} | {patient.unit_type} | Age {getAge(patient.date_of_birth)}
          </p>
          <p className={cn('text-sm text-secondary line-clamp-2')}>
            {patient.current_status}
          </p>

          <div className={cn('flex items-center gap-4 pt-1')}>
            <span className={cn('inline-flex items-center gap-1 text-sm text-secondary')}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              {latestNote?.nurse_name || 'No notes yet'}
            </span>
            <span className={cn('text-sm text-secondary')}>
              Day {admissionDays}
            </span>
          </div>

          {unresolvedFlagCount > 0 && (
            <Badge variant="warning" className={cn('mt-1')}>
              {unresolvedFlagCount} unresolved flag{unresolvedFlagCount > 1 ? 's' : ''}
            </Badge>
          )}
        </CardContent>

        <CardFooter className={cn('p-0 pt-3')}>
          <p className={cn('text-xs text-muted')}>
            {latestNote
              ? `Last note: ${formatTimestamp(latestNote.created_at)}`
              : 'No notes yet'}
          </p>
        </CardFooter>
      </Card>
    </Link>
  )
}

/** Calculate age from date of birth string */
function getAge(dob: string): string {
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
    age--
  }
  return `${age}`
}

/** Format timestamp for display */
function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) +
    ' ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
