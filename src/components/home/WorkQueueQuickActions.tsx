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
    <div className="mt-auto shrink-0 border-t border-line pt-3">
      <p className="text-[10px] font-medium text-slate-400">빠른 실행</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {HOME_QUICK_ACTIONS.map((action) => (
          <button
            key={action.path}
            type="button"
            onClick={() => onNavigate(action.path)}
            className="chip-pill"
          >
            {action.title}
          </button>
        ))}
      </div>
    </div>
  )
}
