import {
  MAIL_PROVIDER_BADGE_CLASS,
  type MailPreviewData,
} from '../../../lib/mailHubMockData'

type MailPreviewItemProps = {
  mail: MailPreviewData
}

export default function MailPreviewItem({ mail }: MailPreviewItemProps) {
  const badgeClass = MAIL_PROVIDER_BADGE_CLASS[mail.provider]

  return (
    <li className="border-b border-line/60 py-2 last:border-b-0">
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
