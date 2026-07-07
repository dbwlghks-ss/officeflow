type LogoProps = { className?: string; header?: boolean }

type OfficeFlowLogoSize = 'sm' | 'md' | 'header' | 'auth'

const HEADER_LOGO_HEIGHT_CLASS = 'h-[34px]'
const HEADER_LOGO_DIVIDER_CLASS = 'h-[22px]'

function resolveOfficeFlowLogoSize(size: OfficeFlowLogoSize): 'sm' | 'md' {
  return size === 'sm' || size === 'header' ? 'sm' : 'md'
}

/** Official OfficeFlow wordmark — single PNG asset used across the product. */
export function OfficeFlowLogo({
  className,
  size = 'md',
}: {
  className?: string
  size?: OfficeFlowLogoSize
}) {
  const resolved = resolveOfficeFlowLogoSize(size)
  const heightClass = resolved === 'sm' ? HEADER_LOGO_HEIGHT_CLASS : 'h-[34px]'

  return (
    <img
      src="/officeflow-logo.png"
      alt="OfficeFlow"
      className={`w-auto shrink-0 object-contain ${heightClass}${className ? ` ${className}` : ''}`}
    />
  )
}

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

/** Header brand lockup: [official HWASHIN CI] | [OfficeFlow logo] */
export function HeaderBrandLockup({ onOfficeFlowClick }: { onOfficeFlowClick?: () => void }) {
  return (
    <div className="flex items-center gap-2">
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
          className={`${HEADER_LOGO_HEIGHT_CLASS} w-auto object-contain`}
        />
      </a>
      <span
        aria-hidden="true"
        className={`${HEADER_LOGO_DIVIDER_CLASS} w-px shrink-0 bg-line`}
      />
      <button
        type="button"
        onClick={onOfficeFlowClick}
        className="shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <OfficeFlowLogo size="header" />
      </button>
    </div>
  )
}
