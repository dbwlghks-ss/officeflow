import { useNavigate } from 'react-router-dom'
import { formatHomeHeroDate, getHomeBriefContent } from '../lib/homeBrief'
import Header from '../components/layout/Header'
import BentoCard from '../components/home/BentoCard'
import BriefBentoBlock from '../components/home/BriefBentoBlock'
import HomeHeroGreeting from '../components/home/HomeHeroGreeting'
import OfficeFlowAssistant from '../components/home/OfficeFlowAssistant'
import QuickActionsPanel from '../components/home/QuickActionsPanel'
import MailHubPanel from '../components/home/mail/MailHubPanel'
import RecentUpdates from '../components/home/recent-updates/RecentUpdates'

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

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
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

          <div className="lg:col-span-8">
            <BentoCard>
              <RecentUpdates embedded />
            </BentoCard>
          </div>

          <div className="lg:col-span-4">
            <BentoCard>
              <MailHubPanel />
            </BentoCard>
          </div>

          <div className="lg:col-span-12">
            <BentoCard>
              <QuickActionsPanel onNavigate={navigate} />
            </BentoCard>
          </div>
        </div>
      </main>
    </div>
  )
}
