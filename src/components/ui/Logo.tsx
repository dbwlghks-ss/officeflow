type LogoProps = { className?: string }

/**
 * OfficeFlow product logo — rounded gradient mark + wordmark.
 * `compact` renders the mark only (for collapsed contexts).
 */
export function OfficeFlowLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-brand to-brand-hover shadow-[0_6px_16px_-6px_rgba(0,64,152,0.65)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="3.4" rx="1.7" fill="white" />
          <rect x="3" y="10.3" width="12" height="3.4" rx="1.7" fill="white" opacity="0.85" />
          <rect x="3" y="16.6" width="7" height="3.4" rx="1.7" fill="white" opacity="0.6" />
        </svg>
      </div>
      {!compact && (
        <span className="text-[19px] font-bold tracking-tight text-slate-900">
          Office<span className="text-brand">Flow</span>
        </span>
      )}
    </div>
  )
}

/** HWASHIN corporate mark — recreated cleanly as SVG (chevron hexagon + wordmark). */
export function HwashinLogo({ className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 2.5 28 9.25v13.5L16 29.5 4 22.75V9.25z" fill="#EEF5FF" />
        <path
          d="M10.5 11 16.5 16l-6 5"
          stroke="#004098"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 11 21.5 16l-6 5"
          stroke="#004098"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
      <span className="text-[14px] font-extrabold tracking-tight text-brand">HWASHIN</span>
    </span>
  )
}
