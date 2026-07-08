import { useState } from 'react'
import { ExternalLink, Mail, Pencil, Trash2 } from 'lucide-react'
import type { MailAccountData } from '../../../lib/mailHubMockData'
import { getAccountDisplayLabel } from '../../../lib/mailHubStorage'

type MailAccountItemProps = {
  account: MailAccountData
  variant?: 'default' | 'accent'
  compact?: boolean
  onMarkRead?: (accountId: string) => void
  onEdit?: (accountId: string) => void
  onDelete?: (accountId: string) => void
}

function openWebmail(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function MailAccountItem({
  account,
  variant = 'default',
  compact = false,
  onMarkRead,
  onEdit,
  onDelete,
}: MailAccountItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const displayLabel = getAccountDisplayLabel(account)
  const isPending = account.status === 'pending'
  const canOpen = Boolean(account.webmailUrl) && !isPending
  const onAccent = variant === 'accent'
  const hasUnread = account.unreadCount > 0

  const surfaceClass =
    'flex items-center gap-1.5 rounded-btn border ' +
    (compact ? 'px-2 py-1.5 ' : 'gap-2 px-2.5 py-2 ') +
    (onAccent ? 'border-white/50 bg-white/55' : 'border-line/70 bg-canvas/40') +
    (isPending && !canOpen ? ' opacity-60' : '')

  function handleOpen() {
    if (!canOpen || !account.webmailUrl) return
    openWebmail(account.webmailUrl)
  }

  return (
    <li className="group list-none">
      {confirmDelete ? (
        <div className={surfaceClass}>
          <p className="min-w-0 flex-1 text-xs font-medium text-slate-700">이 메일 계정을 삭제할까요?</p>
          <button
            type="button"
            onClick={() => onDelete?.(account.id)}
            className="rounded-md bg-danger px-2 py-1 text-[11px] font-medium text-white"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-medium text-slate-600"
          >
            취소
          </button>
        </div>
      ) : (
        <div className={surfaceClass}>
          {canOpen ? (
            <button
              type="button"
              onClick={handleOpen}
              className="flex min-w-0 flex-1 items-center gap-2 text-left transition-colors hover:opacity-90"
              aria-label={`${displayLabel} 메일함 새 탭에서 열기`}
              title="메일함 열기"
            >
              <AccountMeta account={account} showExternal />
            </button>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <AccountMeta account={account} showExternal={false} />
            </div>
          )}

          <div className="flex shrink-0 items-center gap-1">
            {hasUnread ? (
              <>
                <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-semibold tabular-nums text-brand">
                  {account.unreadCount}건
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onMarkRead?.(account.id)
                  }}
                  className="rounded-md border border-line/70 bg-surface px-1.5 py-0.5 text-[10px] font-medium text-slate-600 transition-colors hover:border-brand/20 hover:text-brand"
                  title="OfficeFlow에서 확인 완료 처리"
                >
                  확인 완료
                </button>
              </>
            ) : (
              <span className="px-1 text-[10px] font-medium text-slate-400">확인 완료</span>
            )}

            {onEdit ? (
              <button
                type="button"
                aria-label={`${displayLabel} 수정`}
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(account.id)
                }}
                className="grid h-6 w-6 place-items-center rounded-md text-slate-400 opacity-0 transition-opacity hover:bg-white/80 hover:text-brand group-hover:opacity-100"
              >
                <Pencil size={12} strokeWidth={1.75} aria-hidden="true" />
              </button>
            ) : null}

            {onDelete ? (
              <button
                type="button"
                aria-label={`${displayLabel} 삭제`}
                onClick={(event) => {
                  event.stopPropagation()
                  setConfirmDelete(true)
                }}
                className="grid h-6 w-6 place-items-center rounded-md text-slate-400 opacity-0 transition-opacity hover:bg-white/80 hover:text-danger group-hover:opacity-100"
              >
                <Trash2 size={12} strokeWidth={1.75} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      )}
    </li>
  )
}

function AccountMeta({
  account,
  showExternal,
}: {
  account: MailAccountData
  showExternal: boolean
}) {
  const isPending = account.status === 'pending'
  const displayLabel = getAccountDisplayLabel(account)

  return (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-slate-500">
        <Mail size={15} strokeWidth={1.75} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-xs font-semibold text-slate-900">{displayLabel}</p>
          {isPending ? (
            <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              {account.statusLabel ?? '연동 대기'}
            </span>
          ) : null}
        </div>
        <p className="truncate text-xs text-slate-500">{account.email}</p>
      </div>

      {showExternal ? (
        <ExternalLink
          size={12}
          strokeWidth={1.75}
          className="shrink-0 text-slate-400"
          aria-hidden="true"
        />
      ) : null}
    </>
  )
}
