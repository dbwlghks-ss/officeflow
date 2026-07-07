import type { InboxSectionData } from '../../../lib/unifiedInboxMockData'
import InboxItem from './InboxItem'

type InboxSectionProps = {
  section: InboxSectionData
}

export default function InboxSection({ section }: InboxSectionProps) {
  if (section.items.length === 0) return null

  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {section.title}
      </p>
      <ul className="m-0 list-none p-0">
        {section.items.map((item, index) => (
          <InboxItem
            key={item.id}
            item={item}
            isLast={index === section.items.length - 1}
          />
        ))}
      </ul>
    </div>
  )
}
