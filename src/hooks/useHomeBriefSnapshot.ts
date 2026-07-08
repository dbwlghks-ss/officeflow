import { useEffect, useRef, useState } from 'react'
import { ASSISTANT_DATA_UPDATED_EVENT } from '../lib/assistantDataEvents'
import {
  mapSnapshotToBriefSummary,
  type BriefDisplayMode,
  type BriefSummaryData,
} from '../lib/homeBriefSummary'
import { fetchAssistantSnapshot } from '../services/assistantDataService'
import { NOTICE_READ_EVENT } from '../services/noticeReadService'

type UseHomeBriefSnapshotOptions = {
  /** When set, skips live fetch and uses this summary (tests). */
  summary?: Partial<BriefSummaryData>
}

export function useHomeBriefSnapshot(options: UseHomeBriefSnapshotOptions = {}) {
  const { summary } = options
  const [displayMode, setDisplayMode] = useState<BriefDisplayMode>(
    summary ? 'ready' : 'loading',
  )
  const [summaryData, setSummaryData] = useState<BriefSummaryData | null>(
    summary
      ? {
          mealStatusLabel: summary.mealStatusLabel ?? '신청 완료',
          mealApplied: summary.mealApplied ?? true,
          mealDeclined: summary.mealDeclined ?? false,
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
      console.error('[home-brief] snapshot fetch failed:', error)
      if (seq !== requestSeq.current) return
      setSummaryData(null)
      setDisplayMode('error')
    }
  })

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
    window.addEventListener(ASSISTANT_DATA_UPDATED_EVENT, handleRefresh)
    window.addEventListener('focus', handleRefresh)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener(NOTICE_READ_EVENT, handleRefresh)
      window.removeEventListener(ASSISTANT_DATA_UPDATED_EVENT, handleRefresh)
      window.removeEventListener('focus', handleRefresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [summary])

  return { displayMode, summaryData, refresh: () => void loadSnapshot.current() }
}
