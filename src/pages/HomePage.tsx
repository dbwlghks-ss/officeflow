import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardList,
  Megaphone,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import Header from '../components/layout/Header'

type QuickAction = {
  title: string
  description: string
  path: string
  icon: LucideIcon
}

const actions: QuickAction[] = [
  {
    title: '식수 신청',
    description: '오늘의 식사를 간편하게 신청하고 이번 주 신청 현황을 확인하세요.',
    path: '/meal',
    icon: UtensilsCrossed,
  },
  {
    title: '설문조사',
    description: '진행 중인 설문에 참여하고 의견을 전달하세요.',
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

      <main className="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-10 lg:py-11">
        <section className="mb-8">
          <p className="mb-1 text-sm font-medium text-slate-400">{today}</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {greeting}.
          </h1>
          <p className="mt-2 max-w-xl text-base text-slate-500">
            사내 업무를 하나로 연결하는 스마트 플랫폼. 무엇을 시작할까요?
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.title}
                type="button"
                onClick={() => navigate(action.path)}
                className="group relative flex h-full min-h-[240px] flex-col items-start overflow-hidden rounded-card border border-line bg-surface p-8 text-left shadow-soft transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-slate-300/80 hover:shadow-[0_8px_32px_-12px_rgba(16,24,40,0.14),0_2px_8px_rgba(16,24,40,0.06)]"
              >
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-brand-light text-brand transition-transform duration-500 ease-out group-hover:scale-105">
                  <Icon size={28} strokeWidth={1.75} />
                </div>

                <h2 className="mt-auto pt-8 text-xl font-bold text-slate-900">{action.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{action.description}</p>

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
          })}
        </section>
      </main>
    </div>
  )
}
