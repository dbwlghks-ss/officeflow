import { ArrowRight, type LucideIcon } from 'lucide-react'

export type QuickActionItemProps = {
  title: string
  description: string
  icon: LucideIcon
  onClick: () => void
}

export default function QuickActionItem({
  title,
  description,
  icon: Icon,
  onClick,
}: QuickActionItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-center gap-3 rounded-btn px-2 py-3 text-left transition-colors hover:bg-canvas"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-slate-500">
          <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-slate-400 transition-colors group-hover:text-brand">
          바로가기
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </button>
    </li>
  )
}
