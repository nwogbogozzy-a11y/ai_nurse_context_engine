'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Patient, Note } from '@/lib/types'
import { PatientCard } from '@/components/PatientCard'

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [latestNotes, setLatestNotes] = useState<Record<string, Note | null>>({})
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
        for (const p of patientsData) {
          const { data: notes } = await supabase
            .from('notes')
            .select('*')
            .eq('patient_id', p.id)
            .order('created_at', { ascending: false })
            .limit(1)

          noteMap[p.id] = notes?.[0] || null
        }
        setLatestNotes(noteMap)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-primary">Patient Dashboard</h2>
        <p className="text-sm text-secondary mt-1">
          {patients.length} active patients | Day shift
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-5 animate-pulse">
              <div className="h-6 bg-border rounded w-3/4 mb-3" />
              <div className="h-4 bg-border rounded w-1/2 mb-3" />
              <div className="h-4 bg-border rounded w-full mb-3" />
              <div className="h-3 bg-border rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              latestNote={latestNotes[patient.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
