'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface NurseIdentity {
  name: string
  initials: string
  shift: string
}

export const NURSES: Record<string, NurseIdentity> = {
  'Sarah Chen': { name: 'Sarah Chen', initials: 'SC', shift: 'Night' },
  'Marcus Webb': { name: 'Marcus Webb', initials: 'MW', shift: 'Morning' },
}

interface NurseContextValue {
  nurse: NurseIdentity
  setNurse: (name: string) => void
  isDictating: boolean
  setIsDictating: (v: boolean) => void
}

const NurseContext = createContext<NurseContextValue | null>(null)

interface NurseProviderProps {
  children: ReactNode
}

export function NurseProvider({ children }: NurseProviderProps) {
  const [nurse, setNurseState] = useState<NurseIdentity>(NURSES['Sarah Chen'])
  const [isDictating, setIsDictating] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('nurse_name')
    if (stored && NURSES[stored]) {
      setNurseState(NURSES[stored])
    }
  }, [])

  const setNurse = (name: string) => {
    if (!NURSES[name]) return
    setNurseState(NURSES[name])
    localStorage.setItem('nurse_name', name)
  }

  return (
    <NurseContext.Provider value={{ nurse, setNurse, isDictating, setIsDictating }}>
      {children}
    </NurseContext.Provider>
  )
}

export function useNurse(): NurseContextValue {
  const context = useContext(NurseContext)
  if (!context) {
    throw new Error('useNurse must be used within a NurseProvider')
  }
  return context
}
