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
        <div className="mb-5">
          <HomeHeroGreeting dateLabel={dateLabel} greeting={brief.greeting} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-5">
          <div className="h-fit self-start lg:col-span-8">
            <BentoCard>
              <BriefBentoBlock date={now} />
            </BentoCard>
          </div>

          <div className="h-fit self-start lg:col-span-4">
            <BentoCard>
              <AssistantPanel onNavigate={navigate} />
            </BentoCard>
          </div>

          <div className="h-fit self-start lg:col-span-8">
            <BentoCard compact>
              <QuickActionsPanel onNavigate={navigate} />
            </BentoCard>
          </div>

          <div className="h-fit self-start lg:col-span-4">
            <BentoCard compact>
              <MailHubPanel />
            </BentoCard>
          </div>
        </div>
      </main>
    </div>
  )
}
