import { useNavigate } from 'react-router-dom'
import { ClipboardList, Megaphone, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { formatHomeHeroDate, getHomeBriefContent } from '../lib/homeBrief'
import Header from '../components/layout/Header'
import BentoCard from '../components/home/BentoCard'
import BriefBentoBlock from '../components/home/BriefBentoBlock'
import HomeHeroGreeting from '../components/home/HomeHeroGreeting'
import OfficeFlowAssistant from '../components/home/OfficeFlowAssistant'
import QuickActionCard from '../components/home/QuickActionCard'
import RecentUpdates from '../components/home/recent-updates/RecentUpdates'

type QuickAction = {
  title: string
  description: string
  path: string
  icon: LucideIcon
  statusLabel?: string
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
  const brief = getHomeBriefContent(now)
  const dateLabel = formatHomeHeroDate(now)

  return (
    <div className="min-h-screen bg-canvas text-slate-800">
      <Header />

      <main className="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-10 lg:py-11">
        <div className="mb-6">
          <HomeHeroGreeting dateLabel={dateLabel} greeting={brief.greeting} />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-8">
            <BentoCard>
              <BriefBentoBlock date={now} />
            </BentoCard>
          </div>

          <div className="lg:col-span-4">
            <BentoCard>
              <OfficeFlowAssistant />
            </BentoCard>
          </div>

          <div className="lg:col-span-12">
            <BentoCard>
              <RecentUpdates embedded />
            </BentoCard>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {actions.map((action) => (
            <QuickActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              statusLabel={action.statusLabel}
              onClick={() => navigate(action.path)}
            />
          ))}
        </section>
      </main>
    </div>
  )
}
