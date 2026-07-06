import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

/** Shared input / textarea / select styling (Design System). */
export const inputClass =
  'w-full rounded-input border border-line bg-surface px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand/40 focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60'

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-btn font-semibold whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white shadow-[0_6px_16px_-8px_rgba(0,64,152,0.8)] hover:bg-brand-hover active:scale-[0.98]',
  secondary:
    'border border-line bg-surface text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]',
  ghost: 'text-slate-600 hover:bg-slate-100 active:scale-[0.98]',
  danger: 'bg-danger text-white hover:bg-red-700 active:scale-[0.98]',
  success: 'bg-success text-white hover:bg-green-700 active:scale-[0.98]',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}) {
  return (
    <button
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */
export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-surface shadow-soft',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */
type BadgeTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger'

const badgeTones: Record<BadgeTone, string> = {
  brand: 'bg-brand-light text-brand ring-brand/15',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200/70',
  success: 'bg-green-50 text-success ring-green-200/70',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200/70',
  danger: 'bg-red-50 text-danger ring-red-200/70',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
