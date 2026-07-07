import { getHomeBriefContent, type HomeBriefContent } from '../../lib/homeBrief'
import {
  getBriefSummaryData,
  toBriefSummaryItems,
  type BriefSummaryData,
} from '../../lib/homeBriefSummary'
import BriefSummaryList from './BriefSummaryList'

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
    <div className="flex h-full min-h-0 flex-col">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/65">
        {resolved.title}
      </p>
      <h2 className="mt-2 text-lg font-bold leading-snug tracking-tight text-white lg:text-xl">
        오늘 업무를 한눈에 확인하세요.
      </h2>
      <BriefSummaryList
        items={summaryItems}
        tone="brand"
        columns={2}
        className="mt-3 lg:mt-auto"
      />
    </div>
  )
}
