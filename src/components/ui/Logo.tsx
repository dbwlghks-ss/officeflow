type LogoProps = { className?: string; header?: boolean }

type OfficeFlowLogoSize = 'sm' | 'md' | 'header' | 'auth'

const HEADER_LOGO_HEIGHT_CLASS = 'h-[34px]'
const OFFICEFLOW_HEADER_HEIGHT_CLASS = HEADER_LOGO_HEIGHT_CLASS
const HWASHIN_HEADER_HEIGHT_CLASS = HEADER_LOGO_HEIGHT_CLASS
const HEADER_LOCKUP_GAP_CLASS = 'gap-[10px]'
const HEADER_LOCKUP_DIVIDER_CLASS = 'h-[18px] w-px shrink-0 bg-line/90'
const HWASHIN_LOGO_SRC = '/hwashin-symbol.png'

function resolveOfficeFlowLogoSize(size: OfficeFlowLogoSize): 'sm' | 'md' {
  return size === 'sm' || size === 'header' ? 'sm' : 'md'
}

/** Official HWASHIN lockup — single PNG asset used across the product. */
export function HwashinLogoImage({ className }: { className?: string }) {
  return (
    <img
      src={HWASHIN_LOGO_SRC}
      alt="HWASHIN"
      className={`w-auto shrink-0 object-contain object-left-bottom${className ? ` ${className}` : ''}`}
    />
  )
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

/** HWASHIN corporate lockup — official PNG. */
export function HwashinLogo({ className, header = false }: LogoProps) {
  const heightClass = header ? HWASHIN_HEADER_HEIGHT_CLASS : 'h-[28px]'

  return <HwashinLogoImage className={`${heightClass}${className ? ` ${className}` : ''}`} />
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
        <HwashinLogoImage className={`${HWASHIN_HEADER_HEIGHT_CLASS} block max-h-none`} />
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
