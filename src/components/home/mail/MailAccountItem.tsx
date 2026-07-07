import { Mail } from 'lucide-react'
import type { MailAccountData } from '../../../lib/mailHubMockData'

type MailAccountItemProps = {
  account: MailAccountData
  variant?: 'default' | 'accent'
  compact?: boolean
}

export default function MailAccountItem({
  account,
  variant = 'default',
  compact = false,
}: MailAccountItemProps) {
  const isPending = account.status === 'pending'
  const onAccent = variant === 'accent'

  return (
    <li
      className={
        'flex items-center gap-2 rounded-btn border ' +
        (compact ? 'px-2 py-1.5 ' : 'gap-2.5 px-2.5 py-2 ') +
        (onAccent
          ? 'border-white/50 bg-white/55'
          : 'border-line/70 bg-canvas/40')
      }
    >
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

      {!isPending && account.unreadCount !== null ? (
        <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-semibold tabular-nums text-brand">
          {account.unreadCount}건
        </span>
      ) : null}
    </li>
  )
}
