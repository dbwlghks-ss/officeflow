import { getBriefTimeIconMeta } from '../../lib/briefTimeIcon'

type BriefTimeWatermarkProps = {
  date?: Date
}

export default function BriefTimeWatermark({ date = new Date() }: BriefTimeWatermarkProps) {
  const { Icon, iconClassName } = getBriefTimeIconMeta(date)

  return <Icon className={iconClassName} strokeWidth={1.25} aria-hidden="true" />
}
