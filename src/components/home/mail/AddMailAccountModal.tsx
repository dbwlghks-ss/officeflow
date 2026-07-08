import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { MailProvider } from '../../../lib/mailHubMockData'
import {
  DEFAULT_WEBMAIL_URL,
  createMailAccount,
  isValidEmail,
  type NewMailAccountInput,
} from '../../../lib/mailHubStorage'

type AddMailAccountModalProps = {
  open: boolean
  onClose: () => void
  onSave: (account: ReturnType<typeof createMailAccount>) => void
}

const PROVIDER_OPTIONS: { id: MailProvider; label: string }[] = [
  { id: 'gmail', label: 'Gmail' },
  { id: 'naver', label: 'Naver' },
  { id: 'company', label: 'Company Mail' },
  { id: 'custom', label: 'Custom' },
]

const EMPTY_FORM = {
  provider: 'gmail' as MailProvider,
  label: '',
  email: '',
  webmailUrl: DEFAULT_WEBMAIL_URL.gmail ?? '',
  unreadCount: 0,
}

export default function AddMailAccountModal({ open, onClose, onSave }: AddMailAccountModalProps) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return

    setForm(EMPTY_FORM)

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

  const canSave = isValidEmail(form.email) && form.label.trim().length > 0

  function handleProviderChange(provider: MailProvider) {
    const defaultUrl = DEFAULT_WEBMAIL_URL[provider] ?? ''
    setForm((current) => ({
      ...current,
      provider,
      webmailUrl: defaultUrl,
      label: current.label || PROVIDER_OPTIONS.find((option) => option.id === provider)?.label || '',
    }))
  }

  function handleSave() {
    if (!canSave) return

    const input: NewMailAccountInput = {
      provider: form.provider,
      label: form.label.trim(),
      email: form.email.trim(),
      webmailUrl: form.webmailUrl.trim() || undefined,
      unreadCount: Math.max(0, form.unreadCount),
    }

    onSave(createMailAccount(input))
    onClose()
  }

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
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-modal border border-line bg-surface p-6 shadow-pop"
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
        <p className="mt-1 text-sm text-slate-500">계정 정보를 입력해 Mail Hub에 추가하세요.</p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">메일 서비스</span>
            <select
              value={form.provider}
              onChange={(event) => handleProviderChange(event.target.value as MailProvider)}
              className="h-9 w-full rounded-btn border border-line/70 bg-canvas/50 px-3 text-sm text-slate-700 focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/10"
            >
              {PROVIDER_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">계정 이름</span>
            <input
              type="text"
              value={form.label}
              onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
              placeholder="예: 개인 Gmail, 회사 메일"
              className="h-9 w-full rounded-btn border border-line/70 bg-canvas/50 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">이메일 주소</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="example@gmail.com"
              className="h-9 w-full rounded-btn border border-line/70 bg-canvas/50 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">웹메일 주소</span>
            <input
              type="url"
              value={form.webmailUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, webmailUrl: event.target.value }))
              }
              placeholder="https://mail.google.com/mail/"
              className="h-9 w-full rounded-btn border border-line/70 bg-canvas/50 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">안 읽은 메일 수</span>
            <input
              type="number"
              min={0}
              value={form.unreadCount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  unreadCount: Math.max(0, Number(event.target.value) || 0),
                }))
              }
              className="h-9 w-full rounded-btn border border-line/70 bg-canvas/50 px-3 text-sm text-slate-700 focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-btn border border-line bg-surface px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-canvas"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={
              'rounded-btn px-4 py-2 text-sm font-medium text-white transition-colors ' +
              (canSave ? 'bg-brand hover:bg-brand-hover' : 'cursor-not-allowed bg-brand/40')
            }
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
