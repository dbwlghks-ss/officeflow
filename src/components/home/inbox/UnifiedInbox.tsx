import {
  getUnifiedInboxSections,
  type InboxSectionData,
} from '../../../lib/unifiedInboxMockData'
import InboxSection from './InboxSection'

type UnifiedInboxProps = {
  /** Replace mock sections with Supabase or Mail/Calendar feeds later. */
  sections?: InboxSectionData[]
}

export default function UnifiedInbox({ sections }: UnifiedInboxProps) {
  const resolvedSections = getUnifiedInboxSections(sections)

  return (
    <section className="mb-10 max-w-3xl" aria-label="Unified Inbox">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Unified Inbox</h2>
        <p className="mt-0.5 text-sm text-slate-500">오늘 처리할 업무를 한곳에서 확인하세요.</p>
      </div>

      <div className="space-y-6">
        {resolvedSections.map((section) => (
          <InboxSection key={section.id} section={section} />
        ))}
      </div>
    </section>
  )
}
