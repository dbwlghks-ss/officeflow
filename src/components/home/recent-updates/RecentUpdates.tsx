import {
  getRecentUpdatesSections,
  type RecentUpdatesSectionData,
} from '../../../lib/recentUpdatesMockData'
import RecentUpdatesSection from './RecentUpdatesSection'

type RecentUpdatesProps = {
  /** Replace mock sections with Supabase or Mail/Calendar feeds later. */
  sections?: RecentUpdatesSectionData[]
  /** When true, omits outer width constraints for Bento Grid embedding. */
  embedded?: boolean
}

export default function RecentUpdates({ sections, embedded = false }: RecentUpdatesProps) {
  const resolvedSections = getRecentUpdatesSections(sections)

  return (
    <section
      className={embedded ? '' : 'max-w-3xl'}
      aria-label="Recent Updates"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Recent Updates</h2>
        <p className="mt-0.5 text-sm text-slate-500">최근 업무 업데이트를 확인하세요.</p>
      </div>

      <div className="space-y-5">
        {resolvedSections.map((section) => (
          <RecentUpdatesSection key={section.id} section={section} />
        ))}
      </div>
    </section>
  )
}
