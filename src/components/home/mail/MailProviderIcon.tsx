import { Building2, Mail } from 'lucide-react'
import type { MailProvider } from '../../../lib/mailHubMockData'

type MailProviderIconProps = {
  provider: MailProvider
  compact?: boolean
}

const PROVIDER_CONTAINER_CLASS: Partial<Record<MailProvider, string>> = {
  gmail: 'bg-red-50',
  naver: 'bg-emerald-50',
  company: 'bg-brand-light',
}

function GmailMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 7.5 12 12.75 19.5 7.5V17.25A1.5 1.5 0 0 1 18 18.75H6A1.5 1.5 0 0 1 4.5 17.25V7.5Z"
        fill="#D93025"
        fillOpacity="0.82"
      />
      <path
        d="M4.5 7.5 12 12.75 19.5 7.5"
        stroke="#B31412"
        strokeOpacity="0.45"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <path d="M4.5 7.5 12 12.75V7.5H4.5Z" fill="#34A853" fillOpacity="0.55" />
      <path d="M19.5 7.5 12 12.75V7.5h7.5Z" fill="#FBBC05" fillOpacity="0.55" />
    </svg>
  )
}

function NaverMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.25 5.5h2.65l4.35 9.9V5.5H17v13h-2.65l-4.35-9.9V18.5h-2.75V5.5Z"
        fill="#03AF57"
        fillOpacity="0.9"
      />
    </svg>
  )
}

export default function MailProviderIcon({ provider, compact = false }: MailProviderIconProps) {
  const iconSize = compact ? 16 : 17
  const containerSize = compact ? 'h-7 w-7 rounded-lg' : 'h-8 w-8 rounded-lg'
  const containerTint = PROVIDER_CONTAINER_CLASS[provider] ?? 'bg-surface'

  function renderIcon() {
    switch (provider) {
      case 'gmail':
        return <GmailMark size={iconSize} />
      case 'naver':
        return <NaverMark size={iconSize} />
      case 'company':
        return <Building2 size={iconSize} strokeWidth={1.75} className="text-brand" aria-hidden="true" />
      default:
        return <Mail size={iconSize} strokeWidth={1.75} className="text-slate-500" aria-hidden="true" />
    }
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center ${containerSize} ${containerTint}`}
      aria-hidden="true"
    >
      {renderIcon()}
    </div>
  )
}
