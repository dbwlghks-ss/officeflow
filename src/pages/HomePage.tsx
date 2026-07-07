import { useNavigate } from 'react-router-dom'
import { formatHomeHeroDate, getHomeBriefContent } from '../lib/homeBrief'
import Header from '../components/layout/Header'
import BentoCard from '../components/home/BentoCard'
import BriefBentoBlock from '../components/home/BriefBentoBlock'
import HomeHeroGreeting from '../components/home/HomeHeroGreeting'
import AssistantPanel from '../components/home/assistant/AssistantPanel'
import QuickActionsPanel from '../components/home/QuickActionsPanel'
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

      <main
        className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-6 py-4 lg:max-h-[calc(100dvh-var(--header-h))] lg:min-h-0 lg:px-10 lg:py-4"
        style={{ ['--header-h' as string]: `${HEADER_HEIGHT_PX}px` }}
      >
        <div className="mb-3 shrink-0 lg:mb-4">
          <HomeHeroGreeting dateLabel={dateLabel} greeting={brief.greeting} />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12 lg:grid-rows-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-4">
          <div className="min-h-0 lg:col-span-4 lg:row-start-1">
            <BentoCard variant="brand" fit className="flex h-full min-h-0 flex-col overflow-hidden">
              <BriefBentoBlock date={now} />
            </BentoCard>
          </div>

          <div className="min-h-0 lg:col-span-8 lg:row-start-1">
            <BentoCard variant="muted" fit className="flex h-full min-h-0 flex-col overflow-hidden">
              <AssistantPanel onNavigate={navigate} />
            </BentoCard>
          </div>

          <div className="min-h-0 lg:col-span-8 lg:row-start-2">
            <BentoCard fit className="flex h-full min-h-0 flex-col overflow-hidden">
              <QuickActionsPanel onNavigate={navigate} />
            </BentoCard>
          </div>

          <div className="min-h-0 lg:col-span-4 lg:row-start-2">
            <BentoCard variant="accent" fit className="flex h-full min-h-0 flex-col overflow-hidden">
              <MailHubPanel />
            </BentoCard>
          </div>
        </div>
      </main>
    </div>
  )
}
