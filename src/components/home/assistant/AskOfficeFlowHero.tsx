import { useAssistantWorkspace } from './AssistantWorkspaceProvider'
import AssistantHeroSearch from './AssistantHeroSearch'
import AssistantHeroLibrary from './AssistantHeroLibrary'
import AssistantResponseCard from './AssistantResponseCard'
import AssistantSuggestedChips from './AssistantSuggestedChips'

type AskOfficeFlowHeroProps = {
  onNavigate?: (path: string) => void
  compact?: boolean
}

export default function AskOfficeFlowHero({ onNavigate, compact = false }: AskOfficeFlowHeroProps) {
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
    <section className="w-full" aria-label="Ask OfficeFlow">
      <div className={compact ? 'text-left' : 'text-center'}>
        <p className="home-section-eyebrow text-brand/70">Ask OfficeFlow</p>
        {!compact ? (
          <p className="mt-1 text-xs text-slate-500">업무 질문과 처리를 한곳에서</p>
        ) : null}
      </div>

      <div className={compact ? 'mt-2' : 'mt-3'}>
        <AssistantHeroSearch
          value={directQuery}
          onChange={setDirectQuery}
          onSubmit={() => void handleDirectQuery()}
          fullWidth={compact}
        />
      </div>

      {suggestedQueries.length > 0 ? (
        <div className={compact ? 'mt-2' : 'mt-2.5'}>
          <p
            className={
              'mb-1 text-[10px] font-medium text-slate-400 ' + (compact ? 'text-left' : 'text-center')
            }
          >
            추천 명령
          </p>
          <AssistantSuggestedChips
            variant={compact ? 'default' : 'hero'}
            queries={suggestedQueries}
            maxVisible={4}
            onSelect={(query) => void handleSuggestedQuery(query)}
          />
        </div>
      ) : null}

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

      <AssistantHeroLibrary compact={compact} />
    </section>
  )
}
