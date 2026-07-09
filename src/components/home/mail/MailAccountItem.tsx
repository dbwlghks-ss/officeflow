import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { MailAccountData } from '../../../lib/mailHubMockData'
import { getAccountDisplayLabel } from '../../../lib/mailHubStorage'
import MailProviderIcon from './MailProviderIcon'

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

const BADGE_BASE =
  'inline-flex h-[22px] shrink-0 items-center rounded-full px-2 text-[10px] font-medium leading-none'

function StatusBadge({
  account,
  onMarkRead,
}: {
  account: MailAccountData
  onMarkRead?: (accountId: string) => void
}) {
  const isPending = account.status === 'pending'
  const hasUnread = account.unreadCount > 0

  if (isPending) {
    return (
      <span className={`${BADGE_BASE} bg-amber-50/90 text-amber-700/90`}>
        {account.statusLabel ?? '설정 필요'}
      </span>
    )
  }

  if (hasUnread) {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onMarkRead?.(account.id)
        }}
        className={`${BADGE_BASE} cursor-pointer bg-brand/10 text-brand transition-colors hover:bg-brand/15`}
        title="확인 완료로 표시"
        aria-label="확인 완료로 표시"
      >
        읽지 않음 {account.unreadCount}
      </button>
    )
  }

  return (
    <span className={`${BADGE_BASE} bg-slate-100/90 text-slate-500`} aria-label="확인 완료">
      확인 완료
    </span>
  )
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

  const surfaceBase =
    'flex min-w-0 items-center gap-1.5 rounded-btn border ' +
    (compact ? 'px-2 py-1.5 ' : 'gap-2 px-2.5 py-2 ') +
    (onAccent ? 'border-white/50 bg-white/55' : 'border-line/70 bg-canvas/40')

  const surfaceHover =
    canOpen ? (onAccent ? ' transition-colors hover:bg-white/70' : ' transition-colors hover:bg-canvas/60') : ''

  const surfaceClass = surfaceBase + surfaceHover

  function handleOpen() {
    if (!canOpen || !account.webmailUrl) return
    openWebmail(account.webmailUrl)
  }

  const accountBody = (
    <>
      <MailProviderIcon provider={account.provider} compact={compact} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-900">{displayLabel}</p>
        <p className="truncate text-xs text-slate-500">{account.email}</p>
      </div>
    </>
  )

  const editBtnClass =
    'grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-400 transition-colors ' +
    (onAccent ? 'hover:bg-white/80 hover:text-slate-600' : 'hover:bg-canvas hover:text-slate-600')

  const deleteBtnClass =
    editBtnClass +
    ' opacity-0 transition-opacity hover:text-danger group-hover:opacity-100 ' +
    (onAccent ? 'hover:bg-danger/8' : 'hover:bg-danger/8')

  return (
    <li className="group list-none">
      {confirmDelete ? (
        <div className={surfaceBase}>
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
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 overflow-hidden text-left"
              aria-label={`${displayLabel} 메일함 새 탭에서 열기`}
              title="메일함 열기"
            >
              {accountBody}
            </button>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">{accountBody}</div>
          )}

          <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
            <StatusBadge account={account} onMarkRead={onMarkRead} />

            {onEdit ? (
              <button
                type="button"
                aria-label="메일 계정 수정"
                title="메일 계정 수정"
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(account.id)
                }}
                className={editBtnClass}
              >
                <Pencil size={14} strokeWidth={1.75} aria-hidden="true" />
              </button>
            ) : null}

            {onDelete ? (
              <button
                type="button"
                aria-label={`${displayLabel} 삭제`}
                title="메일 계정 삭제"
                onClick={(event) => {
                  event.stopPropagation()
                  setConfirmDelete(true)
                }}
                className={deleteBtnClass}
              >
                <Trash2 size={13} strokeWidth={1.75} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      )}
    </li>
  )
}
