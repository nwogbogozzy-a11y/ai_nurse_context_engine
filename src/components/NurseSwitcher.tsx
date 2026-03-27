'use client'

import { useNurse, NURSES } from '@/contexts/NurseContext'

export function NurseSwitcher() {
  const { nurse, setNurse, isDictating } = useNurse()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newName = e.target.value
    if (isDictating) {
      const confirmed = window.confirm(
        'Switching nurse will discard current dictation. Continue?'
      )
      if (!confirmed) return
    }
    setNurse(newName)
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={nurse.name}
        onChange={handleChange}
        aria-label="Select active nurse"
        className="px-3 py-1.5 text-sm text-primary bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {Object.values(NURSES).map(n => (
          <option key={n.name} value={n.name}>
            {n.name}, RN — {n.shift} Shift
          </option>
        ))}
      </select>
      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
        <span className="text-xs font-semibold text-accent">{nurse.initials}</span>
      </div>
    </div>
  )
}
