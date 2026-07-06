import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardList,
  Megaphone,
  Settings,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import Header from '../components/layout/Header'

type QuickAction = {
  title: string
  description: string
  path: string
  icon: LucideIcon
  variant: 'feature' | 'default'
  span: string
}

const actions: QuickAction[] = [
  {
    title: '식수 신청',
    description: '오늘의 식사를 간편하게 신청하고 이번 주 신청 현황을 확인하세요.',
    path: '/meal',
    icon: UtensilsCrossed,
    variant: 'feature',
    span: 'md:col-span-2',
  },
  {
    title: '설문조사',
    description: '진행 중인 설문에 참여합니다.',
    path: '/survey',
    icon: ClipboardList,
    variant: 'default',
    span: 'md:col-span-1',
  },
  {
    title: '공지사항',
    description: '사내 공지와 소식을 확인합니다.',
    path: '/notice',
    icon: Megaphone,
    variant: 'default',
    span: 'md:col-span-1',
  },
  {
    title: '관리자',
    description: '식수·설문·공지 운영과 임직원 관리를 한곳에서.',
    path: '/admin',
    icon: Settings,
    variant: 'feature',
    span: 'md:col-span-2',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  const now = new Date()
  const today = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
  const hour = now.getHours()
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후예요' : '좋은 저녁이에요'

  return (
    <div className="min-h-screen bg-canvas text-slate-800">
      <Header />

      <main className="mx-auto w-full max-w-[1600px] px-6 py-12 lg:px-10 lg:py-16">
        <section className="mb-12">
          <p className="mb-2 text-sm font-medium text-slate-400">{today}</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {greeting}. <span className="text-brand">OfficeFlow</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-500">
            사내 업무를 하나로 연결하는 스마트 플랫폼. 무엇을 시작할까요?
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon
            const isFeature = action.variant === 'feature'
            return (
              <button
                key={action.title}
                type="button"
                onClick={() => navigate(action.path)}
                className={
                  'group relative flex min-h-[220px] flex-col items-start overflow-hidden rounded-card p-8 text-left transition-all duration-300 hover:-translate-y-1 ' +
                  action.span +
                  (isFeature
                    ? ' bg-gradient-to-br from-brand to-brand-hover text-white shadow-card hover:shadow-pop'
                    : ' border border-line bg-surface text-slate-800 shadow-soft hover:border-slate-300 hover:shadow-card')
                }
              >
                <div
                  className={
                    'mb-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ' +
                    (isFeature ? 'bg-white/15 text-white' : 'bg-brand-light text-brand')
                  }
                >
                  <Icon size={26} strokeWidth={1.8} />
                </div>

                <h2 className={'mt-8 text-xl font-bold ' + (isFeature ? 'text-white' : 'text-slate-900')}>
                  {action.title}
                </h2>
                <p
                  className={
                    'mt-1.5 max-w-md text-sm leading-relaxed ' +
                    (isFeature ? 'text-white/80' : 'text-slate-500')
                  }
                >
                  {action.description}
                </p>

                <span
                  className={
                    'mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ' +
                    (isFeature ? 'text-white' : 'text-brand')
                  }
                >
                  바로가기
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>

                {isFeature && (
                  <Icon
                    size={190}
                    strokeWidth={1}
                    className="pointer-events-none absolute -bottom-10 -right-8 text-white/10"
                  />
                )}
              </button>
            )
          })}
        </section>
      </main>
    </div>
  )
}
