type LogoProps = { className?: string; header?: boolean }

type OfficeFlowLogoSize = 'sm' | 'md' | 'header' | 'auth'

const OFFICEFLOW_HEADER_HEIGHT_CLASS = 'h-[34px]'
const HWASHIN_HEADER_HEIGHT_CLASS = 'h-[48px]'
const HEADER_LOCKUP_GAP_CLASS = 'gap-[10px]'
const HEADER_LOCKUP_DIVIDER_CLASS = 'h-[18px] w-px shrink-0 bg-line/90'
const HWASHIN_BRAND_BLUE = '#004098'

function HwashinMark() {
  return (
    <g fill={HWASHIN_BRAND_BLUE}>
      <path d="M8.5 1 13.5 1 14 2.5 8 15.5 8 18 10 16.5 13 10.5 13 8.5 17.5 1 22 1 22 4.5 16 17.5 17.5 18 21 12.5 21 10.5 24 5.5 25 1 31 1 31 3.5 28 8.5 28 10.5 26 13.5 25 18 45.5 18 46 21.5 41 32.5 40 37.5 38.5 39 33 37.5 39 22.5 16.5 22 17 23.5 17 25.5 23 37.5 17.5 39 14 33.5 14 31.5 11 26.5 10 22 8 24.5 14 36.5 14 39 8.5 39 8 37.5 4 30.5 4 28.5 0 19.5 6 6.5 6 4.5 8.5 1Z" />
      <path d="M34.5 1 41 2.5 45 11.5 46 17 41.5 17 40 15.5 35 4.5 34.5 1Z" />
      <path d="M19.5 23 26 24.5 30 33.5 31 39 26.5 39 25 37.5 20 26.5 19.5 23Z" />
    </g>
  )
}

/** Official HWASHIN lockup — vector SVG with tight symbol/wordmark spacing. */
export function HwashinHeaderLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 210 39"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="HWASHIN"
      preserveAspectRatio="xMinYMax meet"
      className={className}
    >
      <HwashinMark />
      <text
        x="50"
        y="30.5"
        fill={HWASHIN_BRAND_BLUE}
        fontFamily="Arial, Helvetica, 'Segoe UI', sans-serif"
        fontSize="27"
        fontWeight="700"
        letterSpacing="-0.5"
      >
        HWASHIN
      </text>
    </svg>
  )
}

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
  const heightClass = resolved === 'sm' ? OFFICEFLOW_HEADER_HEIGHT_CLASS : 'h-[34px]'

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

/** Header brand lockup: [HWASHIN CI] | [OfficeFlow logo] */
export function HeaderBrandLockup({ onOfficeFlowClick }: { onOfficeFlowClick?: () => void }) {
  return (
    <div className={`inline-flex items-end ${HEADER_LOCKUP_GAP_CLASS}`}>
      <a
        href="https://www.hwashin.co.kr"
        target="_blank"
        rel="noopener noreferrer"
        className="block shrink-0 cursor-pointer p-0 leading-none transition-opacity duration-200 hover:opacity-90"
        onClick={(e) => e.stopPropagation()}
      >
        <HwashinHeaderLogo
          className={`${HWASHIN_HEADER_HEIGHT_CLASS} block w-auto max-h-none`}
        />
      </a>
      <span aria-hidden="true" className={`${HEADER_LOCKUP_DIVIDER_CLASS} self-center`} />
      <button
        type="button"
        onClick={onOfficeFlowClick}
        className="block shrink-0 p-0 leading-none outline-none focus-visible:ring-2 focus-visible:ring-brand/30 rounded-md"
      >
        <OfficeFlowLogo size="header" className="block object-left-bottom" />
      </button>
    </div>
  )
}
