import { getHomeBriefContent, type HomeBriefContent } from '../../lib/homeBrief'
import {
  getBriefSummaryData,
  toBriefSummaryItems,
  type BriefSummaryData,
} from '../../lib/homeBriefSummary'
import BriefSummaryList from './BriefSummaryList'
import HomeHeroBriefHeader from './HomeHeroBriefHeader'

type BriefBentoBlockProps = {
  date?: Date
  content?: Partial<HomeBriefContent>
  summary?: Partial<BriefSummaryData>
}

export default function BriefBentoBlock({
  date = new Date(),
  content,
  summary,
}: BriefBentoBlockProps) {
  const resolved = { ...getHomeBriefContent(date), ...content }
  const summaryItems = toBriefSummaryItems(getBriefSummaryData(summary))

  return (
    <div className="flex h-full flex-col">
      <HomeHeroBriefHeader
        emoji={resolved.emoji}
        title={resolved.title}
        intro={resolved.intro}
      />
      <BriefSummaryList items={summaryItems} className="mt-auto" />
    </div>
  )
}
