/** Extensible provider types for future Gmail API / Microsoft Graph / IMAP integrations. */
export type MailProvider = 'gmail' | 'naver' | 'outlook' | 'company' | 'custom' | 'imap'

export type MailAccountStatus = 'connected' | 'pending' | 'error'

export type MailAccountSource = 'default' | 'custom' | 'synced'

export type MailSyncStatus = 'manual' | 'connected' | 'error'

export type MailAccountData = {
  id: string
  provider: MailProvider
  label: string
  email: string
  unreadCount: number
  status: MailAccountStatus
  statusLabel?: string
  /** Provider webmail URL — opens in a new tab when the account row is clicked. */
  webmailUrl?: string
  source: MailAccountSource
  createdAt: string
  updatedAt?: string
  /** Reserved for future provider sync integrations. */
  providerAccountId?: string
  lastSyncedAt?: string
  syncStatus?: MailSyncStatus
}

export type MailPreviewData = {
  id: string
  accountId: string
  provider: MailProvider
  providerLabel: string
  from: string
  subject: string
  preview: string
  /** ISO timestamp for future sorting. */
  receivedAt: string
  timeLabel: string
}

export type MailHubData = {
  accounts: MailAccountData[]
  previews: MailPreviewData[]
}

/** Legacy mock previews — used by Assistant search until real mail sync exists. */
export const MOCK_MAIL_PREVIEWS: MailPreviewData[] = [
  {
    id: 'preview-1',
    accountId: 'mail-gmail',
    provider: 'gmail',
    providerLabel: 'Gmail',
    from: 'HR Team',
    subject: '7월 사내 교육 일정 안내',
    preview: '이번 달 필수 교육 일정과 신청 방법을 공유드립니다.',
    receivedAt: '2026-07-07T14:20:00+09:00',
    timeLabel: '10분 전',
  },
  {
    id: 'preview-2',
    accountId: 'mail-naver',
    provider: 'naver',
    providerLabel: 'Naver',
    from: '김민수',
    subject: '품질회의 자료 검토 요청',
    preview: '첨부된 회의 자료 확인 부탁드립니다.',
    receivedAt: '2026-07-07T13:05:00+09:00',
    timeLabel: '1시간 전',
  },
]

export function getMailHubData(override?: Partial<MailHubData>): MailHubData {
  return {
    accounts: override?.accounts ?? [],
    previews: override?.previews ?? MOCK_MAIL_PREVIEWS,
  }
}

export const MAIL_PROVIDER_BADGE_CLASS: Record<MailProvider, string> = {
  gmail: 'bg-red-50 text-red-600',
  naver: 'bg-emerald-50 text-emerald-700',
  outlook: 'bg-sky-50 text-sky-700',
  company: 'bg-brand-light text-brand',
  custom: 'bg-slate-100 text-slate-600',
  imap: 'bg-slate-100 text-slate-600',
}
