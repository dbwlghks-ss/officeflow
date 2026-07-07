export type AssistantTab = 'command' | 'search'

type AssistantTabsProps = {
  active: AssistantTab
  onChange: (tab: AssistantTab) => void
}

const TABS: { id: AssistantTab; label: string }[] = [
  { id: 'command', label: '명령' },
  { id: 'search', label: '검색' },
]

export default function AssistantTabs({ active, onChange }: AssistantTabsProps) {
  return (
    <div
      className="mt-3 inline-flex rounded-lg bg-canvas/80 p-0.5 ring-1 ring-line/60"
      role="tablist"
      aria-label="Assistant 탭"
    >
      {TABS.map((tab) => {
        const selected = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={
              'rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ' +
              (selected
                ? 'bg-surface text-slate-900 shadow-sm ring-1 ring-line/50'
                : 'text-slate-500 hover:text-slate-700')
            }
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
