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
      className="group relative flex h-full min-h-[168px] flex-col items-start overflow-hidden rounded-card border border-line bg-surface p-6 text-left shadow-soft transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300/70 hover:shadow-[0_4px_20px_-10px_rgba(16,24,40,0.12)]"
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
          <Icon size={22} strokeWidth={1.75} />
        </div>
        <div className="min-h-[26px] shrink-0">
          {statusLabel ? (
            <span className="inline-flex rounded-full bg-canvas px-2.5 py-1 text-xs font-medium text-slate-500">
              {statusLabel}
            </span>
          ) : null}
        </div>
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">{description}</p>

      <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors group-hover:text-brand">
        바로가기
        <ArrowRight
          size={14}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </span>

      <Icon
        size={120}
        strokeWidth={1}
        className="pointer-events-none absolute -bottom-6 -right-4 text-brand/[0.035]"
      />
    </button>
  )
}
