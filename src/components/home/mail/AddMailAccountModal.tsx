import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { MailProvider } from '../../../lib/mailHubMockData'
import {
  DEFAULT_WEBMAIL_URL,
  PROVIDER_EMAIL_DOMAIN,
  createMailAccount,
  emailInputForProviderChange,
  extractEmailLocalPart,
  resolveMailAccountEmail,
  usesLocalPartEmailInput,
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
  email: '',
  webmailUrl: DEFAULT_WEBMAIL_URL.gmail ?? '',
}

const FULL_EMAIL_PLACEHOLDER: Partial<Record<MailProvider, string>> = {
  company: 'employee@company.com',
  custom: 'example@domain.com',
}

function parseLocalPartInput(provider: MailProvider, value: string): { localPart: string; error: string | null } {
  const domain = PROVIDER_EMAIL_DOMAIN[provider]
  if (!domain) return { localPart: value, error: null }

  if (!value.includes('@')) {
    return { localPart: value, error: null }
  }

  const lower = value.toLowerCase()
  if (lower.endsWith(`@${domain}`)) {
    return { localPart: value.slice(0, -(domain.length + 1)), error: null }
  }

  return {
    localPart: extractEmailLocalPart(value),
    error:
      provider === 'gmail'
        ? 'Gmail 계정은 @gmail.com 주소만 사용할 수 있습니다.'
        : 'Naver 계정은 @naver.com 주소만 사용할 수 있습니다.',
  }
}

export default function AddMailAccountModal({ open, onClose, onSave }: AddMailAccountModalProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [emailError, setEmailError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setForm(EMPTY_FORM)
    setEmailError(null)

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

  const resolvedEmail = resolveMailAccountEmail(form.provider, form.email)
  const canSave = resolvedEmail.valid && !emailError

  function handleProviderChange(provider: MailProvider) {
    const defaultUrl = DEFAULT_WEBMAIL_URL[provider] ?? ''
    setForm((current) => ({
      ...current,
      provider,
      email: emailInputForProviderChange(current.provider, provider, current.email),
      webmailUrl: defaultUrl,
    }))
    setEmailError(null)
  }

  function handleEmailChange(value: string) {
    if (usesLocalPartEmailInput(form.provider)) {
      const { localPart, error } = parseLocalPartInput(form.provider, value)
      setForm((current) => ({ ...current, email: localPart }))
      setEmailError(error)
      return
    }

    setForm((current) => ({ ...current, email: value }))
    setEmailError(null)
  }

  function handleSave() {
    if (!canSave || !resolvedEmail.valid) return

    const input: NewMailAccountInput = {
      provider: form.provider,
      email: resolvedEmail.email,
      webmailUrl: form.webmailUrl.trim() || undefined,
    }

    onSave(createMailAccount(input))
    onClose()
  }

  const usesLocalPart = usesLocalPartEmailInput(form.provider)
  const providerDomain = PROVIDER_EMAIL_DOMAIN[form.provider]
  const displayError =
    emailError ?? (resolvedEmail.valid ? null : form.email.trim() ? resolvedEmail.error : null)

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
            <span className="mb-1 block text-xs font-medium text-slate-600">이메일 주소</span>
            {usesLocalPart && providerDomain ? (
              <div
                className={
                  'flex h-9 items-center overflow-hidden rounded-btn border bg-canvas/50 ' +
                  (displayError
                    ? 'border-danger/40 focus-within:border-danger/40 focus-within:ring-2 focus-within:ring-danger/10'
                    : 'border-line/70 focus-within:border-brand/30 focus-within:ring-2 focus-within:ring-brand/10')
                }
              >
                <input
                  type="text"
                  value={form.email}
                  onChange={(event) => handleEmailChange(event.target.value)}
                  placeholder="example"
                  autoComplete="username"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                <span className="shrink-0 pr-3 text-sm text-slate-400">@{providerDomain}</span>
              </div>
            ) : (
              <input
                type="email"
                value={form.email}
                onChange={(event) => handleEmailChange(event.target.value)}
                placeholder={FULL_EMAIL_PLACEHOLDER[form.provider] ?? 'example@domain.com'}
                className={
                  'h-9 w-full rounded-btn border bg-canvas/50 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 ' +
                  (displayError
                    ? 'border-danger/40 focus:border-danger/40 focus:ring-danger/10'
                    : 'border-line/70 focus:border-brand/30 focus:ring-brand/10')
                }
              />
            )}
            {displayError ? (
              <p className="mt-1 text-xs text-danger">{displayError}</p>
            ) : null}
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
