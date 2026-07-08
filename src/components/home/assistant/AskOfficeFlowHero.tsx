import { useState } from 'react'
import { useAssistantWorkspace } from './AssistantWorkspaceProvider'
import AssistantHeroSearch from './AssistantHeroSearch'
import AssistantResponseCard from './AssistantResponseCard'
import AssistantSuggestedChips from './AssistantSuggestedChips'
import SavedCommandsPopover from './SavedCommandsPopover'

type AskOfficeFlowHeroProps = {
  onNavigate?: (path: string) => void
}

export default function AskOfficeFlowHero({ onNavigate }: AskOfficeFlowHeroProps) {
  const {
    directQuery,
    setDirectQuery,
    response,
    checkedAt,
    suggestedQueries,
    handleDirectQuery,
    handleSuggestedQuery,
  } = useAssistantWorkspace()

  const [showSuggested, setShowSuggested] = useState(false)

  return (
    <section className="mx-auto w-full max-w-4xl" aria-label="Ask OfficeFlow">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1">
          <AssistantHeroSearch
            value={directQuery}
            onChange={setDirectQuery}
            onSubmit={() => void handleDirectQuery()}
          />
        </div>
        <SavedCommandsPopover />
      </div>

      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={() => setShowSuggested((open) => !open)}
          className="text-xs font-medium text-slate-400 transition-colors hover:text-brand"
        >
          {showSuggested ? '추천 명령 숨기기' : '추천 명령 보기'}
        </button>
      </div>

      {showSuggested && suggestedQueries.length > 0 ? (
        <div className="mt-2 flex justify-center">
          <AssistantSuggestedChips
            variant="hero"
            queries={suggestedQueries.slice(0, 4)}
            onSelect={(query) => void handleSuggestedQuery(query)}
          />
        </div>
      ) : null}

      {response ? (
        <div className="mt-4">
          <AssistantResponseCard
            response={response}
            checkedAt={checkedAt}
            onAction={onNavigate}
            onSuggestedQuery={(query) => void handleSuggestedQuery(query)}
            hero
          />
        </div>
      ) : null}
    </section>
  )
}
