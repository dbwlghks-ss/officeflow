import { ClipboardList, Megaphone, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import QuickActionItem from './QuickActionItem'

type QuickAction = {
  title: string
  description: string
  path: string
  icon: LucideIcon
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: '식수 신청',
    description: '오늘의 식수를 신청하고 현황을 확인하세요.',
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
    <section aria-label="Quick Actions">
      <h2 className="text-sm font-semibold tracking-tight text-slate-900">Quick Actions</h2>
      <ul className="mt-2 divide-y divide-line/70">
        {QUICK_ACTIONS.map((action) => (
          <QuickActionItem
            key={action.path}
            title={action.title}
            description={action.description}
            icon={action.icon}
            onClick={() => onNavigate(action.path)}
          />
        ))}
      </ul>
    </section>
  )
}
