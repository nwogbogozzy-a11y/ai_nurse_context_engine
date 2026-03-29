'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Note, SupplyRequest, HandoffReport, AuditLogEntry } from '@/lib/types'

interface UseRealtimeSubscriptionOptions {
  patientId: string
  onNoteInsert: (note: Note) => void
  onNoteUpdate: (note: Note) => void
  onSupplyInsert: (supply: SupplyRequest) => void
  onHandoffInsert: (handoff: HandoffReport) => void
  onAuditInsert: (entry: AuditLogEntry) => void
}

export function useRealtimeSubscription({
  patientId,
  onNoteInsert,
  onNoteUpdate,
  onSupplyInsert,
  onHandoffInsert,
  onAuditInsert,
}: UseRealtimeSubscriptionOptions) {
  useEffect(() => {
    const channel = supabase
      .channel(`patient-detail-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          onNoteInsert(payload.new as Note)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          onNoteUpdate(payload.new as Note)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'supply_requests',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          onSupplyInsert(payload.new as SupplyRequest)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'handoff_reports',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          onHandoffInsert(payload.new as HandoffReport)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_log',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          onAuditInsert(payload.new as AuditLogEntry)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [patientId])
  // Note: callbacks intentionally excluded from deps — callers should use
  // useCallback or refs to keep them stable. Including them would cause
  // channel reconnection on every render.
}
