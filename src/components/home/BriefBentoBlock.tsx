import { useEffect, useRef, useState } from 'react'
import { buildBriefSummaryDisplay } from '../../lib/briefSummarySentence'
import { getHomeBriefContent, type HomeBriefContent } from '../../lib/homeBrief'
import {
  mapSnapshotToBriefSummary,
  toBriefSummaryItems,
  type BriefDisplayMode,
  type BriefSummaryData,
} from '../../lib/homeBriefSummary'
import { formatKoreanTime, KOREAN_CLOCK_TICK_MS } from '../../lib/dateTime'
import { fetchAssistantSnapshot } from '../../services/assistantDataService'
import { NOTICE_READ_EVENT } from '../../services/noticeReadService'
import BriefSummaryList from './BriefSummaryList'

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
  const [displayMode, setDisplayMode] = useState<BriefDisplayMode>(
    summary ? 'ready' : 'loading',
  )
  const [summaryData, setSummaryData] = useState<BriefSummaryData | null>(
    summary
      ? {
          mealStatusLabel: summary.mealStatusLabel ?? '신청 완료',
          mealApplied: summary.mealApplied ?? true,
          mealServiceAvailable: summary.mealServiceAvailable ?? true,
          unreadNoticeCount: summary.unreadNoticeCount ?? 0,
          pendingSurveyCount: summary.pendingSurveyCount ?? 0,
          todayScheduleCount: summary.todayScheduleCount ?? 0,
        }
      : null,
  )
  const requestSeq = useRef(0)

  const loadSnapshot = useRef(async () => {
    if (summary) return

    const seq = ++requestSeq.current
    setDisplayMode('loading')

    try {
      const snapshot = await fetchAssistantSnapshot()
      if (seq !== requestSeq.current) return

      if (!snapshot) {
        setSummaryData(null)
        setDisplayMode('unauthenticated')
        return
      }

      setSummaryData(mapSnapshotToBriefSummary(snapshot))
      setDisplayMode('ready')
    } catch (error) {
      console.error('[brief] snapshot fetch failed:', error)
      if (seq !== requestSeq.current) return
      setSummaryData(null)
      setDisplayMode('error')
    }
  })

  const resolved = { ...getHomeBriefContent(date), ...content }
  const summaryItems = toBriefSummaryItems(
    summaryData ?? {
      mealStatusLabel: '',
      mealApplied: false,
      mealServiceAvailable: false,
      unreadNoticeCount: 0,
      pendingSurveyCount: 0,
      todayScheduleCount: 0,
    },
    displayMode,
  )
  const summaryCopy = buildBriefSummaryDisplay(
    displayMode,
    summaryData ?? undefined,
  )
  const timeLabel = formatKoreanTime(now)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, KOREAN_CLOCK_TICK_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    void loadSnapshot.current()
  }, [summary])

  useEffect(() => {
    if (summary) return

    function handleRefresh() {
      void loadSnapshot.current()
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') handleRefresh()
    }

    window.addEventListener(NOTICE_READ_EVENT, handleRefresh)
    window.addEventListener('focus', handleRefresh)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener(NOTICE_READ_EVENT, handleRefresh)
      window.removeEventListener('focus', handleRefresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [summary])

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
      <BriefSummaryList
        items={summaryItems}
        tone="brand"
        columns={2}
        className="mt-2 lg:mt-auto lg:pt-2.5"
      />
    </div>
  )
}
