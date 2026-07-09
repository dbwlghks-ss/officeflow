import type { BriefActionItem } from '../../lib/briefActions'
import WorkActionButtons from './WorkActionButtons'

type BriefActionPanelProps = {
  items: BriefActionItem[]
  onNavigate?: (path: string) => void
}

export default function BriefActionPanel({ items, onNavigate }: BriefActionPanelProps) {
  if (items.length === 0) return null

  return (
    <div className="mt-2 space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-btn border border-white/[0.14] bg-white/[0.08] px-3 py-2.5"
        >
          <p className="text-xs leading-relaxed text-white/85">{item.message}</p>
          <div className="mt-2">
            <WorkActionButtons
              actions={item.actions}
              onNavigate={onNavigate}
              variant="brand"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
