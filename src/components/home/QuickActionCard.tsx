import { ArrowRight, type LucideIcon } from 'lucide-react'

export type QuickActionCardProps = {
  title: string
  description: string
  icon: LucideIcon
  statusLabel?: string
  onClick: () => void
}

export default function QuickActionCard({
  title,
  description,
  icon: Icon,
  statusLabel,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-full min-h-[220px] flex-col items-start overflow-hidden rounded-card border border-line bg-surface p-8 text-left shadow-soft transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-slate-300/80 hover:shadow-[0_8px_32px_-12px_rgba(16,24,40,0.14),0_2px_8px_rgba(16,24,40,0.06)]"
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-brand-light text-brand transition-transform duration-500 ease-out group-hover:scale-105">
          <Icon size={28} strokeWidth={1.75} />
        </div>
        {statusLabel ? (
          <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-medium text-slate-500">
            {statusLabel}
          </span>
        ) : null}
      </div>

      <h2 className="mt-auto pt-8 text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors duration-300 group-hover:text-brand-hover">
        바로가기
        <ArrowRight
          size={16}
          className="transition-transform duration-500 ease-out group-hover:translate-x-1"
        />
      </span>

      <Icon
        size={160}
        strokeWidth={1}
        className="pointer-events-none absolute -bottom-8 -right-6 text-brand/[0.04] transition-transform duration-500 ease-out group-hover:scale-105"
      />
    </button>
  )
}
