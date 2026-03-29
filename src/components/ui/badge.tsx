'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-accent-foreground shadow',
        secondary:
          'border-transparent bg-surface text-secondary',
        destructive:
          'border-transparent bg-flag-critical text-white shadow',
        outline: 'text-primary',
        warning:
          'border-flag-warning/30 bg-flag-warning-bg text-flag-warning',
        critical:
          'border-flag-critical/30 bg-flag-critical-bg text-flag-critical',
        safe:
          'border-flag-safe/30 bg-flag-safe-bg text-flag-safe',
        review:
          'border-flag-review/30 bg-flag-review-bg text-flag-review',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
export type { BadgeProps }
