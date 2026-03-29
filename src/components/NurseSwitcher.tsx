'use client'

import { useState } from 'react'
import { useNurse, NURSES } from '@/contexts/NurseContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function NurseSwitcher() {
  const { nurse, setNurse, isDictating } = useNurse()
  const [pendingNurse, setPendingNurse] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleNurseChange = (newName: string) => {
    if (newName === nurse.name) return

    if (isDictating) {
      toast.warning('Cannot switch nurse while dictation is in progress')
      return
    }

    setPendingNurse(newName)
    setDialogOpen(true)
  }

  const handleConfirm = () => {
    if (pendingNurse) {
      setNurse(pendingNurse)
    }
    setPendingNurse(null)
    setDialogOpen(false)
  }

  const handleCancel = () => {
    setPendingNurse(null)
    setDialogOpen(false)
  }

  return (
    <div className={cn('flex items-center gap-3')}>
      <div className={cn('flex items-center gap-2')}>
        <span className={cn('text-sm text-secondary hidden sm:inline')}>
          {nurse.shift} Shift
        </span>
        <div
          className={cn(
            'w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center'
          )}
        >
          <span className={cn('text-xs font-semibold text-accent')}>
            {nurse.initials}
          </span>
        </div>
      </div>

      <Select value={nurse.name} onValueChange={handleNurseChange}>
        <SelectTrigger
          className={cn('min-w-[200px] bg-background')}
          aria-label="Select active nurse"
        >
          <SelectValue placeholder="Select nurse" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(NURSES).map((n) => (
            <SelectItem key={n.name} value={n.name}>
              {n.name}, RN — {n.shift} Shift
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch nurse identity</AlertDialogTitle>
            <AlertDialogDescription>
              Switching nurse will attribute all subsequent actions to the new
              identity. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
