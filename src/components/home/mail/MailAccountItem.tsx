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

const ICON_BTN_BASE =
  'grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-400 transition-colors'

function iconBtnClass(onAccent: boolean, hover: 'default' | 'brand' | 'danger' = 'default') {
  const hoverClass =
    hover === 'danger'
      ? 'hover:bg-danger/8 hover:text-danger'
      : hover === 'brand'
        ? onAccent
          ? 'hover:bg-white/70 hover:text-brand'
          : 'hover:bg-canvas hover:text-brand'
        : onAccent
          ? 'hover:bg-white/60 hover:text-slate-600'
          : 'hover:bg-canvas/80 hover:text-slate-600'

  return `${ICON_BTN_BASE} ${hoverClass}`
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
    'flex min-w-0 items-center gap-1.5 rounded-btn border ' +
    (compact ? 'px-2 py-1.5 ' : 'gap-2 px-2.5 py-2 ') +
    (onAccent ? 'border-white/50 bg-white/55' : 'border-line/70 bg-canvas/40')

  function handleOpen() {
    if (!canOpen || !account.webmailUrl) return
    openWebmail(account.webmailUrl)
  }

  const accountBody = (
    <>
      <div
        className={
          'flex shrink-0 items-center justify-center rounded-lg bg-surface text-slate-500 ' +
          (compact ? 'h-7 w-7' : 'h-8 w-8')
        }
      >
        <Mail size={compact ? 14 : 15} strokeWidth={1.75} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-900">{displayLabel}</p>
        <p className="truncate text-xs text-slate-500">{account.email}</p>
      </div>
    </>
  )

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
              className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left transition-opacity hover:opacity-90"
              aria-label={`${displayLabel} 메일함 새 탭에서 열기`}
              title="메일함 열기"
            >
              {accountBody}
            </button>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">{accountBody}</div>
          )}

          <div className="flex shrink-0 items-center gap-0.5 whitespace-nowrap">
            {isPending ? (
              <span className="px-1 text-[10px] font-medium text-amber-700/90">
                {account.statusLabel ?? '관리자 설정 필요'}
              </span>
            ) : null}

            {hasUnread ? (
              <div className="flex items-center gap-0.5 px-0.5">
                <span className="text-[11px] font-semibold tabular-nums text-brand">
                  {account.unreadCount}건
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onMarkRead?.(account.id)
                  }}
                  className="rounded px-0.5 text-[10px] font-medium text-slate-500 transition-colors hover:text-brand"
                  title="OfficeFlow에서 확인 완료 처리"
                >
                  확인
                </button>
              </div>
            ) : null}

            {canOpen ? (
              <button
                type="button"
                aria-label={`${displayLabel} 메일함 새 탭에서 열기`}
                title="메일함 열기"
                onClick={(event) => {
                  event.stopPropagation()
                  handleOpen()
                }}
                className={iconBtnClass(onAccent, 'brand')}
              >
                <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" />
              </button>
            ) : null}

            {onEdit ? (
              <button
                type="button"
                aria-label="메일 계정 수정"
                title="메일 계정 수정"
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(account.id)
                }}
                className={iconBtnClass(onAccent, 'brand')}
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
                className={
                  iconBtnClass(onAccent, 'danger') +
                  ' opacity-0 transition-opacity group-hover:opacity-100'
                }
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
