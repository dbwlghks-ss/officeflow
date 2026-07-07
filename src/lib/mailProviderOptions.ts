import type { MailProvider } from './mailHubMockData'

export type MailProviderOption = {
  id: MailProvider
  name: string
  description: string
  statusBadge: string
}

export const MAIL_PROVIDER_OPTIONS: MailProviderOption[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Google 개인 및 업무 메일',
    statusBadge: '준비 예정',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Microsoft 365 메일',
    statusBadge: '준비 예정',
  },
  {
    id: 'naver',
    name: 'Naver Mail',
    description: '네이버 메일 계정',
    statusBadge: 'IMAP 연동 예정',
  },
  {
    id: 'company',
    name: 'Company Mail',
    description: '사내 메일 시스템',
    statusBadge: '관리자 설정 필요',
  },
]

export const MAIL_CONNECT_PREVIEW_NOTICE =
  '메일 연동 기능은 준비 중입니다.\n현재는 UI 미리보기 단계입니다.'
