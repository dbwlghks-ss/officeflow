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
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/65">
        <span>{resolved.title}</span>
        <span className="mx-1.5 font-normal text-white/40">·</span>
        <span className="normal-case tracking-normal text-white/65">{timeLabel}</span>
      </p>
      <h2 className="mt-1.5 home-section-title text-white">
        오늘 업무를 한눈에 확인하세요.
      </h2>
      <div className="mt-1 line-clamp-2 space-y-0.5 text-sm font-normal leading-relaxed text-white/75">
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
