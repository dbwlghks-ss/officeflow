import type { ReactNode } from 'react'

type BentoCardProps = {
  children: ReactNode
  className?: string
}

export default function BentoCard({ children, className = '' }: BentoCardProps) {
  return (
    <div
      className={`h-full rounded-card border border-line bg-surface p-6 shadow-soft lg:p-8 ${className}`}
    >
      {children}
    </div>
  )
}
