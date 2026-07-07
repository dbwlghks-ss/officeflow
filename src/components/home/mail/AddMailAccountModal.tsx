import { useEffect } from 'react'
import { Building2, Mail, X } from 'lucide-react'
import type { MailProvider } from '../../../lib/mailHubMockData'
import {
  MAIL_CONNECT_PREVIEW_NOTICE,
  MAIL_PROVIDER_OPTIONS,
} from '../../../lib/mailProviderOptions'

type AddMailAccountModalProps = {
  open: boolean
  selectedProvider: MailProvider | null
  onSelectProvider: (provider: MailProvider) => void
  onClose: () => void
}

export default function AddMailAccountModal({
  open,
  selectedProvider,
  onSelectProvider,
  onClose,
}: AddMailAccountModalProps) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="모달 닫기"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-mail-account-title"
        className="relative w-full max-w-md rounded-modal border border-line bg-surface p-6 shadow-pop"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 transition-colors hover:bg-canvas hover:text-slate-600"
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        <h2 id="add-mail-account-title" className="text-lg font-semibold tracking-tight text-slate-900">
          메일 계정 추가
        </h2>
        <p className="mt-1 text-sm text-slate-500">연동할 메일 서비스를 선택하세요.</p>

        <ul className="mt-4 flex list-none flex-col gap-2 p-0">
          {MAIL_PROVIDER_OPTIONS.map((option) => {
            const Icon = option.id === 'company' ? Building2 : Mail
            const isSelected = selectedProvider === option.id

            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => onSelectProvider(option.id)}
                  className={
                    'flex w-full items-start gap-3 rounded-btn border px-3 py-3 text-left transition-colors ' +
                    (isSelected
                      ? 'border-brand/30 bg-brand-light/40'
                      : 'border-line bg-canvas/40 hover:border-slate-300 hover:bg-canvas')
                  }
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-slate-500">
                    <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{option.name}</p>
                      <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {option.statusBadge}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{option.description}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>

        {selectedProvider ? (
          <p className="mt-4 whitespace-pre-line rounded-btn border border-line/70 bg-canvas/60 px-3 py-2.5 text-sm leading-relaxed text-slate-600">
            {MAIL_CONNECT_PREVIEW_NOTICE}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-btn border border-line bg-surface px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-canvas"
          >
            닫기
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-btn bg-brand/40 px-4 py-2 text-sm font-medium text-white"
          >
            연동 준비 중
          </button>
        </div>
      </div>
    </div>
  )
}
