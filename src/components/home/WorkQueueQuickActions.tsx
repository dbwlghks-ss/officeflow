import { ClipboardList, Megaphone, UtensilsCrossed, type LucideIcon } from 'lucide-react'

type QuickAction = {
  title: string
  path: string
  icon: LucideIcon
}

export const HOME_QUICK_ACTIONS: QuickAction[] = [
  { title: '식수', path: '/meal', icon: UtensilsCrossed },
  { title: '설문', path: '/survey', icon: ClipboardList },
  { title: '공지', path: '/notice', icon: Megaphone },
]

type WorkQueueQuickActionsProps = {
  onNavigate: (path: string) => void
}

export default function WorkQueueQuickActions({ onNavigate }: WorkQueueQuickActionsProps) {
  return (
    <div className="mt-auto shrink-0 border-t border-line/60 pt-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">빠른 실행</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {HOME_QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.path}
              type="button"
              onClick={() => onNavigate(action.path)}
              className="inline-flex items-center gap-1 rounded-full border border-line/70 bg-canvas/50 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-brand/25 hover:bg-brand-light/35 hover:text-brand"
            >
              <Icon size={12} strokeWidth={1.75} aria-hidden="true" />
              {action.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}
