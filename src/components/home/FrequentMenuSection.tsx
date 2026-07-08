import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ClipboardList,
  Megaphone,
  Search,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'

type FrequentMenuItem = {
  id: string
  label: string
  icon: LucideIcon
  action: 'navigate' | 'ask'
  path?: string
  askQuery?: string
}

const FREQUENT_MENUS: FrequentMenuItem[] = [
  { id: 'meal', label: '식수 신청', icon: UtensilsCrossed, action: 'navigate', path: '/meal' },
  { id: 'survey', label: '설문조사', icon: ClipboardList, action: 'navigate', path: '/survey' },
  { id: 'notice', label: '공지사항', icon: Megaphone, action: 'navigate', path: '/notice' },
  {
    id: 'employee',
    label: '직원 검색',
    icon: Search,
    action: 'ask',
    askQuery: '직원 연락처 찾기',
  },
  {
    id: 'schedule',
    label: '일정 관리',
    icon: CalendarDays,
    action: 'ask',
    askQuery: '오늘 할 일 알려줘',
  },
]

type FrequentMenuSectionProps = {
  onAskQuery?: (query: string) => void
}

export default function FrequentMenuSection({ onAskQuery }: FrequentMenuSectionProps) {
  const navigate = useNavigate()

  function handleItemClick(item: FrequentMenuItem) {
    if (item.action === 'navigate' && item.path) {
      navigate(item.path)
      return
    }
    if (item.action === 'ask' && item.askQuery && onAskQuery) {
      onAskQuery(item.askQuery)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <section className="mt-6" aria-label="자주 사용하는 메뉴">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">자주 사용하는 메뉴</h2>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-xs font-medium text-slate-400 transition-colors hover:text-brand"
        >
          전체 메뉴 보기 &gt;
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {FREQUENT_MENUS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              className="flex flex-col items-center gap-2 rounded-[20px] border border-line bg-surface px-4 py-5 text-center transition-colors duration-200 hover:border-brand/20 hover:bg-brand-light/30"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-brand">
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
