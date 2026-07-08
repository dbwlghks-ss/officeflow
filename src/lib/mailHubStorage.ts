import type { MailAccountData, MailProvider } from './mailHubMockData'

export const MAIL_ACCOUNTS_STORAGE_KEY = 'officeflow_mail_accounts'

export const DEFAULT_MAIL_ACCOUNTS: MailAccountData[] = [
  {
    id: 'mail-gmail',
    provider: 'gmail',
    label: 'Gmail',
    email: 'sample@gmail.com',
    unreadCount: 3,
    status: 'connected',
    webmailUrl: 'https://mail.google.com/mail/',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
    syncStatus: 'manual',
  },
  {
    id: 'mail-naver',
    provider: 'naver',
    label: 'Naver',
    email: 'sample@naver.com',
    unreadCount: 1,
    status: 'connected',
    webmailUrl: 'https://mail.naver.com/',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
    syncStatus: 'manual',
  },
  {
    id: 'mail-company',
    provider: 'company',
    label: 'Company Mail',
    email: 'employee@company.com',
    unreadCount: 0,
    status: 'pending',
    statusLabel: '관리자 설정 필요',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
    syncStatus: 'manual',
  },
]

export const DEFAULT_WEBMAIL_URL: Partial<Record<MailProvider, string>> = {
  gmail: 'https://mail.google.com/mail/',
  naver: 'https://mail.naver.com/',
}

type LegacyMailAccount = MailAccountData & { providerLabel?: string }

const KNOWN_DOMAIN_LABELS: Record<string, string> = {
  'gmail.com': 'Gmail',
  'googlemail.com': 'Gmail',
  'naver.com': 'Naver',
  'kakao.com': 'Kakao Mail',
}

function capitalizeWord(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

export function generateMailAccountLabel(provider: MailProvider, email?: string): string {
  switch (provider) {
    case 'gmail':
      return 'Gmail'
    case 'naver':
      return 'Naver'
    case 'company':
      return 'Company Mail'
    case 'custom': {
      const domain = email?.trim().split('@')[1]?.toLowerCase()
      if (!domain) return 'Custom Mail'
      if (KNOWN_DOMAIN_LABELS[domain]) return KNOWN_DOMAIN_LABELS[domain]
      const base = domain.split('.')[0]
      if (!base) return 'Custom Mail'
      if (base === 'company') return 'Company Mail'
      return `${capitalizeWord(base)} Mail`
    }
    default:
      return 'Custom Mail'
  }
}

function normalizeAccount(raw: LegacyMailAccount): MailAccountData {
  return {
    ...raw,
    label:
      raw.label ??
      raw.providerLabel ??
      generateMailAccountLabel(raw.provider, raw.email),
    unreadCount: typeof raw.unreadCount === 'number' ? Math.max(0, raw.unreadCount) : 0,
    source: raw.source ?? 'custom',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    syncStatus: raw.syncStatus ?? 'manual',
  }
}

function readStorage(): MailAccountData[] | null {
  try {
    const raw = localStorage.getItem(MAIL_ACCOUNTS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LegacyMailAccount[]
    if (!Array.isArray(parsed)) return null
    return parsed.map(normalizeAccount)
  } catch {
    return null
  }
}

function writeStorage(accounts: MailAccountData[]): void {
  localStorage.setItem(MAIL_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
}

export function loadMailAccounts(): MailAccountData[] {
  return readStorage() ?? DEFAULT_MAIL_ACCOUNTS
}

export function saveMailAccounts(accounts: MailAccountData[]): void {
  writeStorage(accounts)
}

export function createMailAccountId(): string {
  return `mail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export type NewMailAccountInput = {
  provider: MailProvider
  email: string
  webmailUrl?: string
}

export function createMailAccount(input: NewMailAccountInput): MailAccountData {
  const webmailUrl = input.webmailUrl?.trim() || undefined
  const hasUrl = Boolean(webmailUrl)
  const label = generateMailAccountLabel(input.provider, input.email)

  return {
    id: createMailAccountId(),
    provider: input.provider,
    label,
    email: input.email.trim(),
    unreadCount: 0,
    status: hasUrl ? 'connected' : 'pending',
    statusLabel: hasUrl ? undefined : '관리자 설정 필요',
    webmailUrl,
    source: 'custom',
    createdAt: new Date().toISOString(),
    syncStatus: 'manual',
  }
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function markAccountRead(
  accounts: MailAccountData[],
  accountId: string,
): MailAccountData[] {
  return accounts.map((account) =>
    account.id === accountId
      ? { ...account, unreadCount: 0, updatedAt: new Date().toISOString() }
      : account,
  )
}

export function removeMailAccount(
  accounts: MailAccountData[],
  accountId: string,
): MailAccountData[] {
  return accounts.filter((account) => account.id !== accountId)
}

export function addMailAccount(
  accounts: MailAccountData[],
  account: MailAccountData,
): MailAccountData[] {
  return [...accounts, account]
}
