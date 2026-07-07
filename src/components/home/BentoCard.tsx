import type { ReactNode } from 'react'

export type BentoCardVariant = 'default' | 'brand' | 'muted' | 'accent'

type BentoCardProps = {
  children: ReactNode
  className?: string
  variant?: BentoCardVariant
  /** Tighter padding for viewport-fit dashboard cards. */
  fit?: boolean
}

const VARIANT_CLASS: Record<BentoCardVariant, string> = {
  default: 'border-line/80 bg-surface',
  brand: 'border-brand/20 bg-brand text-white',
  muted: 'border-line/50 bg-[#f3f5f7]',
  accent: 'border-[#bdd6e4]/70 bg-[#e8f3f8]',
}

export default function BentoCard({
  children,
  className = '',
  variant = 'default',
  fit = false,
}: BentoCardProps) {
  return (
    <div
      className={
        'rounded-card border shadow-soft ' +
        (fit ? 'p-4 ' : 'p-5 lg:p-6 ') +
        VARIANT_CLASS[variant] +
        (className ? ` ${className}` : '')
      }
    >
      {children}
    </div>
  )
}
