import type { RecentUpdatesSectionData } from '../../../lib/recentUpdatesMockData'
import RecentUpdateItem from './RecentUpdateItem'

type RecentUpdatesSectionProps = {
  section: RecentUpdatesSectionData
}

export default function RecentUpdatesSection({ section }: RecentUpdatesSectionProps) {
  if (section.items.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {section.title}
      </p>
      <ul className="m-0 grid list-none grid-cols-1 gap-x-8 p-0 md:grid-cols-2">
        {section.items.map((item) => (
          <RecentUpdateItem key={item.id} item={item} />
        ))}
      </ul>
    </div>
  )
}
