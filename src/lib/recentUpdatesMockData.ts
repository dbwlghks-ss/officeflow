import type { LucideIcon } from 'lucide-react'

/** Extensible source types — mail, calendar, and ai reserved for future integrations. */
export type RecentUpdateSourceType =
  | 'notice'
  | 'survey'
  | 'meal'
  | 'schedule'
  | 'mail'
  | 'calendar'
  | 'ai'

export type RecentUpdateItemData = {
  id: string
  source: RecentUpdateSourceType
  title: string
  description: string
  timeLabel: string
  /** ISO timestamp for future sorting and grouping. */
  occurredAt: string
}

export type RecentUpdatesSectionData = {
  id: string
  title: string
  items: RecentUpdateItemData[]
}

export const MOCK_RECENT_UPDATES_SECTIONS: RecentUpdatesSectionData[] = [
  {
    id: 'today',
    title: '오늘',
    items: [
      {
        id: 'update-notice-1',
        source: 'notice',
        title: '새 공지',
        description: '사내 안전 수칙 업데이트',
        timeLabel: '5분 전',
        occurredAt: '2026-07-07T13:54:00+09:00',
      },
      {
        id: 'update-survey-1',
        source: 'survey',
        title: '안전교육 설문',
        description: '참여 대기',
        timeLabel: '오늘 마감',
        occurredAt: '2026-07-07T09:00:00+09:00',
      },
      {
        id: 'update-meal-1',
        source: 'meal',
        title: '내일 식수 신청',
        description: '신청 필요',
        timeLabel: '마감 D-1',
        occurredAt: '2026-07-07T08:30:00+09:00',
      },
      {
        id: 'update-schedule-1',
        source: 'schedule',
        title: '품질회의',
        description: '회의실 A',
        timeLabel: '오늘 14:00',
        occurredAt: '2026-07-07T14:00:00+09:00',
      },
      {
        id: 'update-notice-2',
        source: 'notice',
        title: '식수 메뉴 변경',
        description: '내일 점심 메뉴 안내',
        timeLabel: '1시간 전',
        occurredAt: '2026-07-07T13:00:00+09:00',
      },
      {
        id: 'update-survey-2',
        source: 'survey',
        title: '만족도 조사',
        description: '응답 대기',
        timeLabel: '어제',
        occurredAt: '2026-07-06T16:00:00+09:00',
      },
    ],
  },
]

export function getRecentUpdatesSections(
  override?: RecentUpdatesSectionData[],
): RecentUpdatesSectionData[] {
  return override ?? MOCK_RECENT_UPDATES_SECTIONS
}

export type RecentUpdateSourceMeta = {
  label: string
  accentClass: string
}

export const RECENT_UPDATE_SOURCE_META: Record<RecentUpdateSourceType, RecentUpdateSourceMeta> = {
  notice: { label: '공지', accentClass: 'bg-brand-light text-brand' },
  survey: { label: '설문', accentClass: 'bg-violet-50 text-violet-600' },
  meal: { label: '식수', accentClass: 'bg-amber-50 text-amber-700' },
  schedule: { label: '일정', accentClass: 'bg-slate-100 text-slate-600' },
  mail: { label: '메일', accentClass: 'bg-sky-50 text-sky-600' },
  calendar: { label: '캘린더', accentClass: 'bg-emerald-50 text-emerald-600' },
  ai: { label: 'AI', accentClass: 'bg-indigo-50 text-indigo-600' },
}

export type RecentUpdateIconResolver = (source: RecentUpdateSourceType) => LucideIcon
