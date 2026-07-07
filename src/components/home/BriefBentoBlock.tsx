import { useEffect, useState } from 'react'
import { getHomeBriefContent, type HomeBriefContent } from '../../lib/homeBrief'
import {
  getBriefSummaryData,
  toBriefSummaryItems,
  type BriefSummaryData,
} from '../../lib/homeBriefSummary'
import { buildBriefSummaryCopy } from '../../lib/briefSummarySentence'
import { formatKoreanTime, KOREAN_CLOCK_TICK_MS } from '../../lib/dateTime'
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
  const [now, setNow] = useState(() => new Date())
  const resolved = { ...getHomeBriefContent(date), ...content }
  const summaryData = getBriefSummaryData(summary)
  const summaryItems = toBriefSummaryItems(summaryData)
  const summaryCopy = buildBriefSummaryCopy(summaryData)
  const timeLabel = formatKoreanTime(now)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, KOREAN_CLOCK_TICK_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/65">
        <span>{resolved.title}</span>
        <span className="mx-1.5 font-normal text-white/35">·</span>
        <span className="normal-case tracking-normal text-white/55">{timeLabel}</span>
      </p>
      <h2 className="mt-2 text-lg font-bold leading-snug tracking-tight text-white lg:text-xl">
        오늘 업무를 한눈에 확인하세요.
      </h2>
      <div className="mt-1.5 line-clamp-2 space-y-0.5 text-sm leading-relaxed text-white/75 lg:mt-2">
        {summaryCopy.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <BriefSummaryList
        items={summaryItems}
        tone="brand"
        columns={2}
        className="mt-2 lg:mt-auto lg:pt-2.5"
      />
    </div>
  )
}
