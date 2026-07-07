import type { LucideIcon } from 'lucide-react'

/** Extensible source types — mail, calendar, and ai reserved for future integrations. */
export type InboxSourceType =
  | 'notice'
  | 'survey'
  | 'meal'
  | 'schedule'
  | 'mail'
  | 'calendar'
  | 'ai'

export type InboxItemData = {
  id: string
  source: InboxSourceType
  title: string
  description: string
  timeLabel: string
  /** ISO timestamp for future sorting and grouping. */
  occurredAt: string
}

export type InboxSectionData = {
  id: string
  title: string
  items: InboxItemData[]
}

export const MOCK_UNIFIED_INBOX_SECTIONS: InboxSectionData[] = [
  {
    id: 'today',
    title: '오늘',
    items: [
      {
        id: 'inbox-notice-1',
        source: 'notice',
        title: '새 공지',
        description: '사내 안전 수칙 업데이트',
        timeLabel: '5분 전',
        occurredAt: '2026-07-07T13:54:00+09:00',
      },
      {
        id: 'inbox-survey-1',
        source: 'survey',
        title: '안전교육 설문',
        description: '참여 대기',
        timeLabel: '',
        occurredAt: '2026-07-07T09:00:00+09:00',
      },
      {
        id: 'inbox-meal-1',
        source: 'meal',
        title: '내일 식수 신청',
        description: '마감 D-1',
        timeLabel: '',
        occurredAt: '2026-07-07T08:30:00+09:00',
      },
      {
        id: 'inbox-schedule-1',
        source: 'schedule',
        title: '품질회의',
        description: '오늘 14:00',
        timeLabel: '',
        occurredAt: '2026-07-07T14:00:00+09:00',
      },
    ],
  },
]

export function getUnifiedInboxSections(
  override?: InboxSectionData[],
): InboxSectionData[] {
  return override ?? MOCK_UNIFIED_INBOX_SECTIONS
}

/** Icon mapping lives in UI layer; source type drives styling and future routing. */
export type InboxSourceMeta = {
  label: string
  accentClass: string
}

export const INBOX_SOURCE_META: Record<InboxSourceType, InboxSourceMeta> = {
  notice: { label: '공지', accentClass: 'bg-brand-light text-brand' },
  survey: { label: '설문', accentClass: 'bg-violet-50 text-violet-600' },
  meal: { label: '식수', accentClass: 'bg-amber-50 text-amber-700' },
  schedule: { label: '일정', accentClass: 'bg-slate-100 text-slate-600' },
  mail: { label: '메일', accentClass: 'bg-sky-50 text-sky-600' },
  calendar: { label: '캘린더', accentClass: 'bg-emerald-50 text-emerald-600' },
  ai: { label: 'AI', accentClass: 'bg-indigo-50 text-indigo-600' },
}

export type InboxIconResolver = (source: InboxSourceType) => LucideIcon
