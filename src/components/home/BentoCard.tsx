import type { ReactNode } from 'react'

type BentoCardProps = {
  children: ReactNode
  className?: string
  /** Tighter padding for secondary panels (Quick Actions, Mail Hub). */
  compact?: boolean
}

export default function BentoCard({ children, className = '', compact = false }: BentoCardProps) {
  return (
    <div
      className={
        'h-fit rounded-card border border-line bg-surface shadow-soft ' +
        (compact ? 'p-4 lg:p-4' : 'p-4 lg:p-5') +
        (className ? ` ${className}` : '')
      }
    >
      {children}
    </div>
  )
}
