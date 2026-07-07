import { ArrowRight, ClipboardList, Megaphone, UtensilsCrossed, type LucideIcon } from 'lucide-react'

type QuickAction = {
  title: string
  description: string
  path: string
  icon: LucideIcon
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: '식수 신청',
    description: '오늘 식수를 신청하고 확인하세요.',
    path: '/meal',
    icon: UtensilsCrossed,
  },
  {
    title: '설문조사',
    description: '진행 중인 설문에 참여하세요.',
    path: '/survey',
    icon: ClipboardList,
  },
  {
    title: '공지사항',
    description: '사내 공지와 소식을 확인하세요.',
    path: '/notice',
    icon: Megaphone,
  },
]

type QuickActionsPanelProps = {
  onNavigate: (path: string) => void
}

export default function QuickActionsPanel({ onNavigate }: QuickActionsPanelProps) {
  return (
    <section className="flex min-h-[220px] flex-col" aria-label="Quick Actions">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Quick Actions
      </p>
      <h2 className="mt-2 text-xl font-bold leading-snug tracking-tight text-slate-900 lg:text-2xl">
        자주 쓰는 업무를 바로 실행하세요.
      </h2>

      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <li key={action.path}>
              <button
                type="button"
                onClick={() => onNavigate(action.path)}
                className="group flex h-full w-full flex-col rounded-[18px] border border-line/70 bg-canvas/50 p-4 text-left transition-all hover:border-brand/25 hover:bg-brand-light/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-slate-600 ring-1 ring-line/60 transition-colors group-hover:text-brand">
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{action.title}</p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">
                  {action.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-0.5 text-xs font-medium text-slate-400 transition-colors group-hover:text-brand">
                  바로가기
                  <ArrowRight
                    size={13}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
