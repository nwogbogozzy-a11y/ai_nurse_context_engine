'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Patient, Note } from '@/lib/types'
import { PatientCard } from '@/components/PatientCard'
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [latestNotes, setLatestNotes] = useState<Record<string, Note | null>>({})
  const [unresolvedFlags, setUnresolvedFlags] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: patientsData } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: true })

      if (patientsData) {
        setPatients(patientsData)

        const noteMap: Record<string, Note | null> = {}
        const flagCounts: Record<string, number> = {}

        for (const p of patientsData) {
          const { data: notes } = await supabase
            .from('notes')
            .select('*')
            .eq('patient_id', p.id)
            .order('created_at', { ascending: false })
            .limit(1)

          noteMap[p.id] = notes?.[0] || null

          const { count } = await supabase
            .from('notes')
            .select('id', { count: 'exact', head: true })
            .eq('patient_id', p.id)
            .eq('flagged', true)
            .in('review_status', ['pending', 'under_review', 'escalated'])

          flagCounts[p.id] = count || 0
        }

        setLatestNotes(noteMap)
        setUnresolvedFlags(flagCounts)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleNoteInsert = useCallback((note: Note) => {
    // D-07: update latestNotes map for affected patient
    setLatestNotes((prev) => ({
      ...prev,
      [note.patient_id]: note,
    }))
    // Update unresolved flag count if note is flagged
    if (note.flagged) {
      setUnresolvedFlags((prev) => ({
        ...prev,
        [note.patient_id]: (prev[note.patient_id] || 0) + 1,
      }))
    }
  }, [])

  const handleNoteUpdate = useCallback((note: Note) => {
    // D-07: update latestNotes if this is the latest note for that patient
    setLatestNotes((prev) => {
      const current = prev[note.patient_id]
      if (current && current.id === note.id) {
        return { ...prev, [note.patient_id]: note }
      }
      return prev
    })
    // If review_status changed to resolved/approved/overridden, decrement flag count
    if (['approved', 'overridden', 'resolved'].includes(note.review_status)) {
      setUnresolvedFlags((prev) => ({
        ...prev,
        [note.patient_id]: Math.max(0, (prev[note.patient_id] || 0) - 1),
      }))
    }
  }, [])

  useDashboardRealtime({
    onNoteInsert: handleNoteInsert,
    onNoteUpdate: handleNoteUpdate,
  })

  return (
    <div className={cn('max-w-[1600px] mx-auto px-12 py-8')}>
      <div className={cn('mb-8')}>
        <h2 className={cn('text-2xl font-semibold text-primary')}>Patient Dashboard</h2>
        <p className={cn('text-sm text-secondary mt-1')}>
          {patients.length} active patients | Day shift
        </p>
      </div>

      {loading ? (
        <div className={cn('grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8')}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn('bg-surface border border-border rounded-lg p-6 space-y-3')}>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className={cn('grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8')}>
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              latestNote={latestNotes[patient.id]}
              unresolvedFlagCount={unresolvedFlags[patient.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
