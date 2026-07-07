import {
  formatHomeHeroDate,
  getHomeBriefContent,
  type HomeBriefContent,
} from '../../lib/homeBrief'
import {
  getBriefSummaryData,
  toBriefSummaryItems,
  type BriefSummaryData,
} from '../../lib/homeBriefSummary'
import BriefSummaryList from './BriefSummaryList'
import HomeHeroBriefHeader from './HomeHeroBriefHeader'
import HomeHeroGreeting from './HomeHeroGreeting'

type HomeHeroBriefProps = {
  /** Defaults to current time; pass for tests or future server-driven content. */
  date?: Date
  /** Optional override for Supabase or CMS-driven brief copy. */
  content?: Partial<HomeBriefContent>
  /** Optional override for Supabase-driven summary metrics. */
  summary?: Partial<BriefSummaryData>
}

export default function HomeHeroBrief({ date = new Date(), content, summary }: HomeHeroBriefProps) {
  const resolved = { ...getHomeBriefContent(date), ...content }
  const formattedDate = formatHomeHeroDate(date)
  const summaryItems = toBriefSummaryItems(getBriefSummaryData(summary))

  return (
    <section className="mb-8">
      <HomeHeroGreeting dateLabel={formattedDate} greeting={resolved.greeting} />
      <HomeHeroBriefHeader
        emoji={resolved.emoji}
        title={resolved.title}
        intro={resolved.intro}
      />
      <BriefSummaryList items={summaryItems} />
    </section>
  )
}
