'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Note } from '@/lib/types'

interface UseDashboardRealtimeOptions {
  onNoteInsert: (note: Note) => void
  onNoteUpdate: (note: Note) => void
}

export function useDashboardRealtime({
  onNoteInsert,
  onNoteUpdate,
}: UseDashboardRealtimeOptions) {
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
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
        },
        (payload) => {
          onNoteUpdate(payload.new as Note)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}
