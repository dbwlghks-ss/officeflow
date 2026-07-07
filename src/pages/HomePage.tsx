import { useNavigate } from 'react-router-dom'
import { formatHomeHeroDate, getHomeBriefContent } from '../lib/homeBrief'
import Header from '../components/layout/Header'
import BentoCard from '../components/home/BentoCard'
import BriefBentoBlock from '../components/home/BriefBentoBlock'
import HomeHeroGreeting from '../components/home/HomeHeroGreeting'
import AssistantPanel from '../components/home/assistant/AssistantPanel'
import QuickActionsPanel from '../components/home/QuickActionsPanel'
import MailHubPanel from '../components/home/mail/MailHubPanel'

export default function HomePage() {
  const navigate = useNavigate()
  const now = new Date()
  const brief = getHomeBriefContent(now)
  const dateLabel = formatHomeHeroDate(now)

  return (
    <div className="min-h-screen bg-canvas text-slate-800">
      <Header />

      <main className="mx-auto w-full max-w-[1600px] px-6 py-6 lg:px-10 lg:py-8">
        <div className="mb-6">
          <HomeHeroGreeting dateLabel={dateLabel} greeting={brief.greeting} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch lg:gap-5">
          <div className="lg:col-span-4">
            <BentoCard variant="brand" className="h-full">
              <BriefBentoBlock date={now} />
            </BentoCard>
          </div>

          <div className="lg:col-span-8">
            <BentoCard variant="muted" className="h-full">
              <AssistantPanel onNavigate={navigate} />
            </BentoCard>
          </div>

          <div className="lg:col-span-8">
            <BentoCard className="h-full">
              <QuickActionsPanel onNavigate={navigate} />
            </BentoCard>
          </div>

          <div className="lg:col-span-4">
            <BentoCard variant="accent" className="flex h-full flex-col">
              <MailHubPanel />
            </BentoCard>
          </div>
        </div>
      </main>
    </div>
  )
}
