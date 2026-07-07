import { ExternalLink, Mail } from 'lucide-react'
import type { MailAccountData } from '../../../lib/mailHubMockData'

type MailAccountItemProps = {
  account: MailAccountData
  variant?: 'default' | 'accent'
  compact?: boolean
}

function openWebmail(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function MailAccountItem({
  account,
  variant = 'default',
  compact = false,
}: MailAccountItemProps) {
  const isPending = account.status === 'pending'
  const canOpen = Boolean(account.webmailUrl) && !isPending
  const onAccent = variant === 'accent'

  const surfaceClass =
    'flex items-center gap-2 rounded-btn border ' +
    (compact ? 'px-2 py-1.5 ' : 'gap-2.5 px-2.5 py-2 ') +
    (onAccent ? 'border-white/50 bg-white/55' : 'border-line/70 bg-canvas/40')

  const content = (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-slate-500">
        <Mail size={15} strokeWidth={1.75} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-slate-900">{account.providerLabel}</p>
          {isPending ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              {account.statusLabel ?? '연동 대기'}
            </span>
          ) : null}
        </div>
        <p className="truncate text-xs text-slate-500">{account.email}</p>
      </div>

      {canOpen ? (
        <ExternalLink
          size={12}
          strokeWidth={1.75}
          className="shrink-0 text-slate-400"
          aria-hidden="true"
        />
      ) : null}

      {!isPending && account.unreadCount !== null ? (
        <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-semibold tabular-nums text-brand">
          {account.unreadCount}건
        </span>
      ) : null}
    </>
  )

  if (canOpen) {
    return (
      <li className="list-none">
        <button
          type="button"
          onClick={() => openWebmail(account.webmailUrl!)}
          className={
            surfaceClass +
            ' w-full cursor-pointer text-left transition-colors hover:border-brand/20 hover:bg-white/80'
          }
          aria-label={`${account.providerLabel} 메일함 새 탭에서 열기`}
          title="메일함 열기"
        >
          {content}
        </button>
      </li>
    )
  }

  return (
    <li
      className={surfaceClass + (isPending ? ' opacity-60' : '')}
      aria-label={
        isPending
          ? `${account.providerLabel} — ${account.statusLabel ?? '연동 대기'}`
          : account.providerLabel
      }
    >
      {content}
    </li>
  )
}
