import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import BentoCard from './BentoCard'
import BriefBentoBlock from './BriefBentoBlock'
import FrequentMenuSection from './FrequentMenuSection'
import TodayWorkQueue from './TodayWorkQueue'
import MailHubPanel from './mail/MailHubPanel'
import AskOfficeFlowHero from './assistant/AskOfficeFlowHero'
import HomeHeroGreeting from './HomeHeroGreeting'
import { useAssistantWorkspace } from './assistant/AssistantWorkspaceProvider'
import { formatHomeHeroDate, getHomeBriefContent } from '../../lib/homeBrief'

type HomeMainContentProps = {
  onNavigate: (path: string) => void
}

export default function HomeMainContent({ onNavigate }: HomeMainContentProps) {
  const now = new Date()
  const brief = getHomeBriefContent(now)
  const dateLabel = formatHomeHeroDate(now)
  const location = useLocation()
  const { handleDirectQuery, handleSuggestedQuery, setDirectQuery } = useAssistantWorkspace()

  useEffect(() => {
    const pendingAsk = (location.state as { pendingAsk?: string } | null)?.pendingAsk
    if (!pendingAsk) return

    setDirectQuery(pendingAsk)
    void handleDirectQuery(pendingAsk)
    window.history.replaceState({}, document.title)
  }, [location.state, setDirectQuery, handleDirectQuery])

  return (
    <>
      <section className="shrink-0 py-2 lg:py-4">
        <HomeHeroGreeting dateLabel={dateLabel} greeting={brief.greeting} />
        <div className="mt-5 lg:mt-6">
          <AskOfficeFlowHero onNavigate={onNavigate} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        <div className="min-h-[300px] lg:col-span-4">
          <BentoCard variant="brand" fit className="h-full">
            <BriefBentoBlock date={now} onNavigate={onNavigate} />
          </BentoCard>
        </div>

        <div className="min-h-[300px] lg:col-span-5">
          <BentoCard fit className="h-full">
            <TodayWorkQueue onNavigate={onNavigate} />
          </BentoCard>
        </div>

        <div className="min-h-[300px] lg:col-span-3">
          <BentoCard variant="accent" fit className="h-full">
            <MailHubPanel />
          </BentoCard>
        </div>
      </section>

      <FrequentMenuSection onAskQuery={(query) => void handleSuggestedQuery(query)} />
    </>
  )
}
