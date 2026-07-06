type LogoProps = { className?: string; header?: boolean }

const OFFICE_WORD_COLOR = '#0C2340'
const FLOW_WORD_COLOR = '#0A57B5'

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

function FlowWave({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 7"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M1 5.4C3.4 1.2 6.2 1.2 8.6 5.4 10.6 8.8 13.8 8.8 17 5.4"
        stroke={FLOW_WORD_COLOR}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type OfficeFlowLogoSize = 'sm' | 'md' | 'header' | 'auth'

function resolveOfficeFlowLogoSize(size: OfficeFlowLogoSize): 'sm' | 'md' {
  return size === 'sm' || size === 'header' ? 'sm' : 'md'
}

/**
 * OfficeFlow wordmark — Pretendard Bold text with an SVG wave accent on F.
 * Matches official logo colors and proportions without raster assets.
 */
export function OfficeFlowLogo({
  className,
  size = 'md',
}: {
  className?: string
  size?: OfficeFlowLogoSize
}) {
  const resolved = resolveOfficeFlowLogoSize(size)
  const textClass = resolved === 'sm' ? 'text-[22px]' : 'text-[26px]'
  const waveClass = resolved === 'sm' ? 'mb-px h-[6px] w-[14px]' : 'mb-0.5 h-[7px] w-[16px]'

  return (
    <span
      className={`inline-flex shrink-0 select-none items-end font-bold leading-none tracking-[-0.03em] ${textClass}${className ? ` ${className}` : ''}`}
      aria-label="OfficeFlow"
    >
      <span style={{ color: OFFICE_WORD_COLOR }}>Office</span>
      <span className="inline-flex items-end" style={{ color: FLOW_WORD_COLOR }}>
        <span className="relative inline-block">
          <FlowWave className={`absolute bottom-full left-0 ${waveClass}`} />
          F
        </span>
        <span>low</span>
      </span>
    </span>
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

/** Header brand lockup: [official HWASHIN CI] · [OfficeFlow wordmark] */
export function HeaderBrandLockup({ onOfficeFlowClick }: { onOfficeFlowClick?: () => void }) {
  return (
    <div className="flex items-center gap-2.5">
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
        <OfficeFlowLogo size="header" />
      </button>
    </div>
  )
}
