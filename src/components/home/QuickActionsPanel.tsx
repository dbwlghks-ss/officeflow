import { ClipboardList, Megaphone, UtensilsCrossed, type LucideIcon } from 'lucide-react'

type QuickAction = {
  title: string
  path: string
  icon: LucideIcon
}

const QUICK_ACTIONS: QuickAction[] = [
  { title: '식수', path: '/meal', icon: UtensilsCrossed },
  { title: '설문', path: '/survey', icon: ClipboardList },
  { title: '공지', path: '/notice', icon: Megaphone },
]

type QuickActionsPanelProps = {
  onNavigate: (path: string) => void
}

export default function QuickActionsPanel({ onNavigate }: QuickActionsPanelProps) {
  return (
    <section className="flex min-h-0 flex-col" aria-label="Quick Actions">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Quick Actions
      </p>
      <p className="mt-1 text-xs text-slate-500">자주 쓰는 바로가기</p>

      <div className="mt-2.5 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.path}
              type="button"
              onClick={() => onNavigate(action.path)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line/80 bg-surface px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand/30 hover:bg-brand-light/40 hover:text-brand"
            >
              <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
              {action.title}
            </button>
          )
        })}
      </div>
    </section>
  )
}
