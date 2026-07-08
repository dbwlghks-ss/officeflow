import { useAssistantWorkspace } from './AssistantWorkspaceProvider'
import AssistantHeroSearch from './AssistantHeroSearch'
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

      <div className="mt-3 flex justify-center">
        <AssistantSuggestedChips
          variant="hero"
          onSelect={(query) => void handleSuggestedQuery(query)}
        />
      </div>

      {response ? (
        <div className="mt-4">
          <AssistantResponseCard
            response={response}
            checkedAt={checkedAt}
            onAction={onNavigate}
            hero
          />
        </div>
      ) : null}
    </section>
  )
}
