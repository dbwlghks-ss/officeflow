import { useEffect, useState } from 'react'
import { BRIEF_EMPTY_SUMMARY, buildBriefActionItems } from '../../lib/briefActions'
import { buildBriefSummaryDisplay } from '../../lib/briefSummarySentence'
import { getHomeBriefContent, type HomeBriefContent } from '../../lib/homeBrief'
import { toBriefSummaryItems, type BriefSummaryData } from '../../lib/homeBriefSummary'
import { formatKoreanTime, KOREAN_CLOCK_TICK_MS } from '../../lib/dateTime'
import { useHomeBriefSnapshot } from '../../hooks/useHomeBriefSnapshot'
import BriefActionPanel from './BriefActionPanel'
import BriefSummaryList from './BriefSummaryList'

type BriefBentoBlockProps = {
  date?: Date
  content?: Partial<HomeBriefContent>
  onNavigate?: (path: string) => void
  /** Optional override for tests — skips live Supabase fetch when provided. */
  summary?: Partial<BriefSummaryData>
}

export default function BriefBentoBlock({
  date = new Date(),
  content,
  onNavigate,
  summary,
}: BriefBentoBlockProps) {
  const [now, setNow] = useState(() => new Date())
  const { displayMode, summaryData } = useHomeBriefSnapshot({ summary })
  const data = summaryData ?? BRIEF_EMPTY_SUMMARY

  const resolved = { ...getHomeBriefContent(date), ...content }
  const summaryItems = toBriefSummaryItems(data, displayMode)
  const actionItems = buildBriefActionItems(data, displayMode)
  const summaryCopy = buildBriefSummaryDisplay(displayMode, summaryData ?? undefined)
  const timeLabel = formatKoreanTime(now)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, KOREAN_CLOCK_TICK_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
        <span>{resolved.title}</span>
        <span className="mx-1.5 font-normal text-white/45">·</span>
        <span className="normal-case tracking-normal text-white/70">{timeLabel}</span>
      </p>
      <h2 className="mt-2 text-lg font-bold leading-snug tracking-tight text-white lg:text-xl">
        오늘 업무를 한눈에 확인하세요.
      </h2>
      <div className="mt-1.5 line-clamp-2 space-y-0.5 text-sm leading-relaxed text-white/80 lg:mt-2">
        {summaryCopy.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <BriefActionPanel items={actionItems} onNavigate={onNavigate} />
      <BriefSummaryList
        items={summaryItems}
        tone="brand"
        columns={2}
        className="mt-2 lg:mt-auto lg:pt-2.5"
      />
    </div>
  )
}
