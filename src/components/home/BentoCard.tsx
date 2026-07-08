import type { ReactNode } from 'react'

export type BentoCardVariant = 'default' | 'brand' | 'muted' | 'accent'

type BentoCardProps = {
  children: ReactNode
  className?: string
  variant?: BentoCardVariant
  /** @deprecated All cards use unified padding. */
  fit?: boolean
}

const VARIANT_CLASS: Record<BentoCardVariant, string> = {
  default: 'border-line bg-surface',
  brand: 'brief-surface border-white/12 text-white',
  muted: 'border-line bg-surface',
  accent: 'border-line bg-surface',
}

export default function BentoCard({
  children,
  className = '',
  variant = 'default',
}: BentoCardProps) {
  return (
    <div
      className={
        'home-card flex h-full min-h-0 flex-col overflow-hidden shadow-none ' +
        VARIANT_CLASS[variant] +
        (className ? ` ${className}` : '')
      }
    >
      {children}
    </div>
  )
}
