import { useNavigate } from 'react-router-dom'
import { formatHomeHeroDate, getHomeBriefContent } from '../lib/homeBrief'
import Header from '../components/layout/Header'
import BentoCard from '../components/home/BentoCard'
import BriefBentoBlock from '../components/home/BriefBentoBlock'
import HomeHeroGreeting from '../components/home/HomeHeroGreeting'
import { AssistantWorkspaceProvider } from '../components/home/assistant/AssistantWorkspaceProvider'
import AskOfficeFlowHero from '../components/home/assistant/AskOfficeFlowHero'
import AssistantSavedPanel from '../components/home/assistant/AssistantSavedPanel'
import QuickActionsPanel from '../components/home/QuickActionsPanel'
import TodayWorkQueue from '../components/home/TodayWorkQueue'
import MailHubPanel from '../components/home/mail/MailHubPanel'

/** Matches Header sticky height (`h-[72px]`). */
const HEADER_HEIGHT_PX = 72

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
          className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col overflow-y-auto px-6 py-4 lg:max-h-[calc(100dvh-var(--header-h))] lg:min-h-0 lg:px-10 lg:py-4"
          style={{ ['--header-h' as string]: `${HEADER_HEIGHT_PX}px` }}
        >
          <div className="home-hero-surface shrink-0 rounded-[28px] px-2 pb-6 pt-2 lg:px-4 lg:pb-8">
            <div className="mx-auto max-w-3xl text-center lg:max-w-4xl">
              <HomeHeroGreeting dateLabel={dateLabel} greeting={brief.greeting} />
            </div>
            <div className="mt-5 lg:mt-6">
              <AskOfficeFlowHero onNavigate={navigate} />
            </div>
          </div>

          <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-3 lg:mt-5 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-4">
            <div className="min-h-0 lg:col-span-4 lg:row-start-1">
              <BentoCard variant="brand" fit className="flex h-full min-h-0 flex-col overflow-hidden">
                <BriefBentoBlock date={now} onNavigate={navigate} />
              </BentoCard>
            </div>

            <div className="min-h-0 lg:col-span-5 lg:row-start-1">
              <BentoCard fit className="flex h-full min-h-0 flex-col overflow-hidden">
                <TodayWorkQueue onNavigate={navigate} />
              </BentoCard>
            </div>

            <div className="min-h-0 lg:col-span-3 lg:row-start-1">
              <BentoCard variant="accent" fit className="flex h-full min-h-0 flex-col overflow-hidden">
                <MailHubPanel />
              </BentoCard>
            </div>

            <div className="flex min-h-0 flex-col gap-3 lg:col-span-4 lg:row-start-2">
              <BentoCard variant="muted" fit className="shrink-0">
                <QuickActionsPanel onNavigate={navigate} />
              </BentoCard>
            </div>

            <div className="min-h-0 lg:col-span-8 lg:row-start-2">
              <BentoCard variant="muted" fit className="flex max-h-[240px] min-h-[180px] flex-col overflow-hidden">
                <AssistantSavedPanel />
              </BentoCard>
            </div>
          </div>
        </main>
      </AssistantWorkspaceProvider>
    </div>
  )
}
