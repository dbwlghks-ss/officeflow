import { useAssistantWorkspace } from './AssistantWorkspaceProvider'
import AssistantHeroSearch from './AssistantHeroSearch'
import SavedCommandsMenu from './SavedCommandsMenu'
import AssistantResponseCard from './AssistantResponseCard'

type AskOfficeFlowHeroProps = {
  onNavigate?: (path: string) => void
}

export default function AskOfficeFlowHero({ onNavigate }: AskOfficeFlowHeroProps) {
  const {
    directQuery,
    setDirectQuery,
    response,
    checkedAt,
    handleDirectQuery,
    handleSuggestedQuery,
  } = useAssistantWorkspace()

  return (
    <section
      className="mx-auto w-full max-w-3xl px-1 lg:max-w-4xl"
      aria-label="Ask OfficeFlow"
    >
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-brand/80">
        Ask OfficeFlow
      </p>

      <div className="mt-3">
        <SavedCommandsMenu
          searchSlot={
            <AssistantHeroSearch
              value={directQuery}
              onChange={setDirectQuery}
              onSubmit={() => void handleDirectQuery()}
            />
          }
        />
      </div>

      {response ? (
        <div className="mt-3">
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
