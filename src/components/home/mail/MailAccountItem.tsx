import { useState } from 'react'
import type { MailAccountData } from '../../../lib/mailHubMockData'
import { getAccountDisplayLabel } from '../../../lib/mailHubStorage'

type MailAccountItemProps = {
  account: MailAccountData
  onMarkRead?: (accountId: string) => void
  onEdit?: (accountId: string) => void
  onDelete?: (accountId: string) => void
}

function openWebmail(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function MailAccountItem({
  account,
  onMarkRead,
  onEdit,
  onDelete,
}: MailAccountItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const displayLabel = getAccountDisplayLabel(account)
  const isPending = account.status === 'pending'
  const canOpen = Boolean(account.webmailUrl) && !isPending
  const hasUnread = account.unreadCount > 0

  if (confirmDelete) {
    return (
      <li className="py-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-slate-700">삭제할까요?</span>
          <button
            type="button"
            onClick={() => onDelete?.(account.id)}
            className="rounded-md bg-danger px-2 py-0.5 font-medium text-white"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="rounded-md border border-line px-2 py-0.5 font-medium text-slate-600"
          >
            취소
          </button>
        </div>
      </li>
    )
  }

  const rowClass =
    'group flex w-full items-center gap-2 py-2.5 text-left motion-subtle ' +
    (canOpen ? 'cursor-pointer hover:bg-canvas/60' : '')

  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{displayLabel}</p>
        <p className="truncate text-xs font-normal text-slate-500">{account.email}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isPending ? (
          <span className="text-[10px] font-medium text-amber-600">설정 필요</span>
        ) : hasUnread ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onMarkRead?.(account.id)
            }}
            className="text-[10px] font-medium text-brand motion-subtle hover:text-brand-hover"
            title="확인 완료로 표시"
          >
            {account.unreadCount}건
          </button>
        ) : (
          <span className="text-[10px] text-slate-400">확인됨</span>
        )}

        {onEdit ? (
          <button
            type="button"
            aria-label="수정"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(account.id)
            }}
            className="text-[10px] font-medium text-slate-400 opacity-0 motion-subtle group-hover:opacity-100 hover:text-slate-600"
          >
            수정
          </button>
        ) : null}

        {onDelete ? (
          <button
            type="button"
            aria-label="삭제"
            onClick={(event) => {
              event.stopPropagation()
              setConfirmDelete(true)
            }}
            className="text-[10px] font-medium text-slate-400 opacity-0 motion-subtle group-hover:opacity-100 hover:text-danger"
          >
            삭제
          </button>
        ) : null}
      </div>
    </>
  )

  return (
    <li>
      {canOpen ? (
        <button type="button" onClick={() => openWebmail(account.webmailUrl!)} className={rowClass}>
          {content}
        </button>
      ) : (
        <div className={rowClass.replace('cursor-pointer ', '')}>{content}</div>
      )}
    </li>
  )
}
