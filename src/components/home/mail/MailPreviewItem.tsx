import {
  MAIL_PROVIDER_BADGE_CLASS,
  type MailPreviewData,
} from '../../../lib/mailHubMockData'

type MailPreviewItemProps = {
  mail: MailPreviewData
  variant?: 'default' | 'accent'
}

export default function MailPreviewItem({ mail, variant = 'default' }: MailPreviewItemProps) {
  const badgeClass = MAIL_PROVIDER_BADGE_CLASS[mail.provider]
  const onAccent = variant === 'accent'

  return (
    <li
      className={
        'border-b py-2 last:border-b-0 ' +
        (onAccent ? 'border-white/40' : 'border-line/60')
      }
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-semibold text-slate-900">{mail.from}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}
        >
          {mail.providerLabel}
        </span>
      </div>
      <p className="mt-0.5 truncate text-xs text-slate-800">{mail.subject}</p>
      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{mail.preview}</p>
      <p className="mt-0.5 text-[11px] font-medium text-slate-400">{mail.timeLabel}</p>
    </li>
  )
}
