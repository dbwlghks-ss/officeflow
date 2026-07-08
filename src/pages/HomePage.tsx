import { useNavigate } from 'react-router-dom'
import { formatHomeHeroDate, getHomeBriefContent } from '../lib/homeBrief'
import Header from '../components/layout/Header'
import BentoCard from '../components/home/BentoCard'
import BriefBentoBlock from '../components/home/BriefBentoBlock'
import HomeHeroGreeting from '../components/home/HomeHeroGreeting'
import { AssistantWorkspaceProvider } from '../components/home/assistant/AssistantWorkspaceProvider'
import AskOfficeFlowHero from '../components/home/assistant/AskOfficeFlowHero'
import TodayWorkQueue from '../components/home/TodayWorkQueue'
import MailHubPanel from '../components/home/mail/MailHubPanel'

/** Matches Header sticky height (`h-[64px]`). */
const HEADER_HEIGHT_PX = 64

export default function HomePage() {
  const navigate = useNavigate()
  const now = new Date()
  const brief = getHomeBriefContent(now)
  const dateLabel = formatHomeHeroDate(now)

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-slate-800">
      <Header />

      <AssistantWorkspaceProvider>
        <main
          className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col overflow-y-auto px-6 py-3 lg:max-h-[calc(100dvh-var(--header-h))] lg:min-h-0 lg:px-8 lg:py-4"
          style={{ ['--header-h' as string]: `${HEADER_HEIGHT_PX}px` }}
        >
          <div className="home-hero-surface shrink-0">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-6">
              <div className="lg:col-span-4">
                <HomeHeroGreeting dateLabel={dateLabel} greeting={brief.greeting} compact />
              </div>
              <div className="lg:col-span-8">
                <AskOfficeFlowHero onNavigate={navigate} compact />
              </div>
            </div>
          </div>

          <div className="mt-4 grid flex-1 grid-cols-1 gap-4 lg:mt-4 lg:grid-cols-12 lg:items-stretch">
            <div className="min-h-[300px] lg:col-span-4 lg:min-h-[340px]">
              <BentoCard variant="brand" className="h-full">
                <BriefBentoBlock date={now} onNavigate={navigate} />
              </BentoCard>
            </div>

            <div className="min-h-[300px] lg:col-span-5 lg:min-h-[340px]">
              <BentoCard className="h-full">
                <TodayWorkQueue onNavigate={navigate} />
              </BentoCard>
            </div>

            <div className="min-h-[300px] lg:col-span-3 lg:min-h-[340px]">
              <BentoCard className="h-full">
                <MailHubPanel />
              </BentoCard>
            </div>
          </div>
        </main>
      </AssistantWorkspaceProvider>
    </div>
  )
}
