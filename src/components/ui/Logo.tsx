type LogoProps = { className?: string; header?: boolean }

/** Official HWASHIN symbol — triple chevron hex mark. */
function HwashinSymbol({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M8 12 L22 24 L8 36"
        stroke="#004098"
        strokeWidth="5.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M18 12 L32 24 L18 36"
        stroke="#004098"
        strokeWidth="5.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        opacity="0.72"
      />
      <path
        d="M28 12 L42 24 L28 36"
        stroke="#004098"
        strokeWidth="5.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        opacity="0.44"
      />
    </svg>
  )
}

/**
 * OfficeFlow product logo — rounded gradient mark + wordmark.
 * `compact` renders the mark only (for collapsed contexts).
 */
export function OfficeFlowLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-brand to-brand-hover shadow-[0_6px_16px_-6px_rgba(0,64,152,0.65)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="3.4" rx="1.7" fill="white" />
          <rect x="3" y="10.3" width="12" height="3.4" rx="1.7" fill="white" opacity="0.85" />
          <rect x="3" y="16.6" width="7" height="3.4" rx="1.7" fill="white" opacity="0.6" />
        </svg>
      </div>
      {!compact && (
        <span className="text-[19px] font-bold leading-none tracking-tight text-slate-900">
          Office<span className="text-brand">Flow</span>
        </span>
      )}
    </div>
  )
}

/** HWASHIN corporate lockup — official symbol + wordmark. */
export function HwashinLogo({ className, header = false }: LogoProps) {
  const symbolSize = header ? 27 : 20
  const wordSize = header ? 'text-[19px]' : 'text-[14px]'

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <HwashinSymbol size={symbolSize} />
      <span className={`${wordSize} font-extrabold leading-none tracking-tight text-brand`}>
        HWASHIN
      </span>
    </span>
  )
}

/** Official OfficeFlow wordmark — PNG asset, sizing only (no color/image edits). */
export function OfficeFlowLogoImage({
  className,
  size = 'auth',
}: {
  className?: string
  size?: 'header' | 'auth'
}) {
  const heightClass = size === 'header' ? 'h-[28px]' : 'h-[32px]'

  return (
    <img
      src="/officeflow-logo.png"
      alt="OfficeFlow"
      className={`w-auto shrink-0 object-contain ${heightClass}${className ? ` ${className}` : ''}`}
    />
  )
}

/** Header brand lockup: [official HWASHIN CI] · [OfficeFlow logo PNG] */
export function HeaderBrandLockup({ onOfficeFlowClick }: { onOfficeFlowClick?: () => void }) {
  return (
    <div className="flex items-center gap-3.5">
      <a
        href="https://www.hwashin.co.kr"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer shrink-0 transition-opacity duration-200 hover:opacity-90"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src="/hwashin-logo.png"
          alt="HWASHIN"
          className="h-[32px] w-auto object-contain"
        />
      </a>
      <button
        type="button"
        onClick={onOfficeFlowClick}
        className="shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <OfficeFlowLogoImage size="header" />
      </button>
    </div>
  )
}
