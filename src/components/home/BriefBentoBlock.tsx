import { useEffect, useState } from 'react'
import { BRIEF_EMPTY_SUMMARY } from '../../lib/briefActions'
import { getHomeBriefContent, type HomeBriefContent } from '../../lib/homeBrief'
import { toBriefSummaryItems, type BriefSummaryData } from '../../lib/homeBriefSummary'
import { formatKoreanTime, KOREAN_CLOCK_TICK_MS } from '../../lib/dateTime'
import { useHomeBriefSnapshot } from '../../hooks/useHomeBriefSnapshot'
import { useBriefWeather } from '../../hooks/useBriefWeather'
import BriefChecklist from './BriefChecklist'
import BriefSummaryList from './BriefSummaryList'
import BriefTimeWatermark from './BriefTimeWatermark'
import BriefWeatherStrip from './BriefWeatherStrip'

type BriefBentoBlockProps = {
  date?: Date
  content?: Partial<HomeBriefContent>
  /** Optional override for tests — skips live Supabase fetch when provided. */
  summary?: Partial<BriefSummaryData>
}

export default function BriefBentoBlock({
  date = new Date(),
  content,
  summary,
}: BriefBentoBlockProps) {
  const [now, setNow] = useState(() => new Date())
  const { displayMode, summaryData } = useHomeBriefSnapshot({ summary })
  const { weather, status: weatherStatus } = useBriefWeather()
  const data = summaryData ?? BRIEF_EMPTY_SUMMARY

  const resolved = { ...getHomeBriefContent(date), ...content }
  const summaryItems = toBriefSummaryItems(data, displayMode)
  const timeLabel = formatKoreanTime(now)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, KOREAN_CLOCK_TICK_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <BriefTimeWatermark date={now} />
      <p className="relative text-[11px] font-semibold uppercase tracking-wider text-white/70">
        <span>{resolved.title}</span>
        <span className="mx-1.5 font-normal text-white/45">·</span>
        <span className="normal-case tracking-normal text-white/70">{timeLabel}</span>
      </p>
      <BriefWeatherStrip weather={weather} status={weatherStatus} className="mt-1" />
      <h2 className="mt-1.5 text-base font-semibold leading-snug tracking-tight text-white lg:text-lg">
        오늘 업무를 한눈에 확인하세요.
      </h2>
      <BriefChecklist data={data} mode={displayMode} date={now} />
      <BriefSummaryList
        items={summaryItems}
        tone="brand"
        columns={2}
        className="mt-3 lg:mt-auto lg:pt-2"
      />
    </div>
  )
}
