/** Extensible provider types for future Gmail API / Microsoft Graph / IMAP integrations. */
export type MailProvider = 'gmail' | 'naver' | 'outlook' | 'company' | 'imap'

export type MailAccountStatus = 'connected' | 'pending' | 'error'

export type MailAccountData = {
  id: string
  provider: MailProvider
  providerLabel: string
  email: string
  unreadCount: number | null
  status: MailAccountStatus
  statusLabel?: string
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

export const MOCK_MAIL_HUB: MailHubData = {
  accounts: [
    {
      id: 'mail-gmail',
      provider: 'gmail',
      providerLabel: 'Gmail',
      email: 'sample@gmail.com',
      unreadCount: 3,
      status: 'connected',
    },
    {
      id: 'mail-naver',
      provider: 'naver',
      providerLabel: 'Naver',
      email: 'sample@naver.com',
      unreadCount: 1,
      status: 'connected',
    },
    {
      id: 'mail-company',
      provider: 'company',
      providerLabel: 'Company Mail',
      email: 'employee@company.com',
      unreadCount: null,
      status: 'pending',
      statusLabel: '연동 대기',
    },
  ],
  previews: [
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
    {
      id: 'preview-3',
      accountId: 'mail-gmail',
      provider: 'gmail',
      providerLabel: 'Gmail',
      from: 'OfficeFlow',
      subject: '식수 신청 마감 알림',
      preview: '내일 점심 식수 신청 마감이 오늘 17:00입니다.',
      receivedAt: '2026-07-07T11:30:00+09:00',
      timeLabel: '3시간 전',
    },
    {
      id: 'preview-4',
      accountId: 'mail-company',
      provider: 'company',
      providerLabel: 'Company',
      from: '총무팀',
      subject: '사내 보안 점검 안내',
      preview: '금주 금요일 야간 보안 점검이 예정되어 있습니다.',
      receivedAt: '2026-07-07T09:15:00+09:00',
      timeLabel: '오늘 09:15',
    },
    {
      id: 'preview-5',
      accountId: 'mail-naver',
      provider: 'naver',
      providerLabel: 'Naver',
      from: '설문 시스템',
      subject: '안전교육 설문 참여 요청',
      preview: '참여 기한이 오늘까지입니다.',
      receivedAt: '2026-07-06T18:40:00+09:00',
      timeLabel: '어제',
    },
  ],
}

export function getMailHubData(override?: Partial<MailHubData>): MailHubData {
  return {
    accounts: override?.accounts ?? MOCK_MAIL_HUB.accounts,
    previews: override?.previews ?? MOCK_MAIL_HUB.previews,
  }
}

export const MAIL_PROVIDER_BADGE_CLASS: Record<MailProvider, string> = {
  gmail: 'bg-red-50 text-red-600',
  naver: 'bg-emerald-50 text-emerald-700',
  outlook: 'bg-sky-50 text-sky-700',
  company: 'bg-brand-light text-brand',
  imap: 'bg-slate-100 text-slate-600',
}
