import { useAssistantWorkspace } from './AssistantWorkspaceProvider'
import AssistantHeroSearch from './AssistantHeroSearch'
import SavedCommandsMenu from './SavedCommandsMenu'
import AssistantResponseCard from './AssistantResponseCard'
import AssistantSuggestedChips from './AssistantSuggestedChips'

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

  return (
    <section
      className="mx-auto w-full max-w-3xl px-1 lg:max-w-4xl"
      aria-label="Ask OfficeFlow"
    >
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand/80">
          Ask OfficeFlow
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 lg:text-base">
          궁금한 업무를 물어보거나, 필요한 일을 바로 요청하세요.
        </p>
      </div>

      <div className="mt-5">
        <AssistantHeroSearch
          value={directQuery}
          onChange={setDirectQuery}
          onSubmit={() => void handleDirectQuery()}
        />
      </div>

      {suggestedQueries.length > 0 ? (
        <div className="mt-3">
          <p className="mb-1.5 text-center text-[11px] font-medium text-slate-400">추천 명령</p>
          <div className="flex justify-center">
            <AssistantSuggestedChips
              variant="hero"
              queries={suggestedQueries}
              onSelect={(query) => void handleSuggestedQuery(query)}
            />
          </div>
        </div>
      ) : null}

      <SavedCommandsMenu />

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
