import { ASSISTANT_EMPTY_MESSAGE } from '../../../lib/assistantUi'
import type { AssistantResponse } from '../../../types/assistant'
import { Button } from '../../ui/primitives'
import AssistantResponseShell from './response-cards/AssistantResponseShell'
import EmployeeResponseCard from './response-cards/EmployeeResponseCard'
import MealActionResponseCard from './response-cards/MealActionResponseCard'
import MealMenuResponseCard from './response-cards/MealMenuResponseCard'
import UnknownResponseCard from './response-cards/UnknownResponseCard'
import WorkSummaryResponseCard from './response-cards/WorkSummaryResponseCard'

type AssistantResponseCardProps = {
  response: AssistantResponse | null
  checkedAt?: Date | null
  onAction?: (path: string) => void
  onSuggestedQuery?: (query: string) => void
  compact?: boolean
  hero?: boolean
  floating?: boolean
}

function resolveActions(response: AssistantResponse) {
  if (response.actions && response.actions.length > 0) {
    return response.actions.slice(0, 2)
  }
  if (response.action) return [response.action]
  return []
}

function GenericResponseBody({
  response,
  onAction,
  isLoading,
}: {
  response: AssistantResponse
  onAction?: (path: string) => void
  isLoading: boolean
}) {
  const isError = response.state === 'error'
  const actions = resolveActions(response)

  return (
    <>
      {response.message ? (
        <p
          className={
            'mt-1 text-xs leading-relaxed ' +
            (isLoading ? 'text-slate-400' : isError ? 'text-slate-600' : 'text-slate-500')
          }
        >
          {response.message}
        </p>
      ) : null}

      {response.lines.length > 0 ? (
        <ul className="mt-1.5 max-h-40 list-none space-y-0.5 overflow-y-auto p-0">
          {response.lines.map((line) => (
            <li key={line} className="text-xs leading-relaxed text-slate-600">
              {line.startsWith('- ') ? line : `· ${line}`}
            </li>
          ))}
        </ul>
      ) : null}

      {actions.length > 0 && onAction && !isLoading ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {actions.map((action) => (
            <Button
              key={action.path + action.label}
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => onAction(action.path)}
              className="h-7 px-2.5 text-xs"
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </>
  )
}

function resolveKind(response: AssistantResponse): AssistantResponse['kind'] {
  if (response.kind) return response.kind
  if (response.state === 'loading') return 'generic'
  return 'generic'
}

export default function AssistantResponseCard({
  response,
  checkedAt,
  onAction,
  onSuggestedQuery,
  compact = false,
  hero = false,
  floating = false,
}: AssistantResponseCardProps) {
  if (!response) {
    if (hero) return null

    return (
      <div
        className={
          compact
            ? 'rounded-btn border border-dashed border-line/70 bg-canvas/30 px-2.5 py-2 '
            : 'mt-3 rounded-btn border border-dashed border-line/70 bg-canvas/30 px-3 py-3 '
        }
      >
        <p className="text-xs leading-relaxed text-slate-400">{ASSISTANT_EMPTY_MESSAGE}</p>
      </div>
    )
  }

  const isLoading = response.state === 'loading'
  const kind = resolveKind(response)

  if (kind === 'employee' && response.employee) {
    return (
      <AssistantResponseShell response={response} checkedAt={checkedAt} hero={hero} floating={floating} compact={compact}>
        {response.message ? (
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{response.message}</p>
        ) : null}
        <EmployeeResponseCard payload={response.employee} />
      </AssistantResponseShell>
    )
  }

  if (kind === 'meal' && response.mealMenu) {
    return (
      <AssistantResponseShell response={response} checkedAt={checkedAt} hero={hero} floating={floating} compact={compact}>
        <MealMenuResponseCard payload={response.mealMenu} message={response.message} />
        {!isLoading && response.action && onAction ? (
          <div className="mt-2.5">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => onAction(response.action!.path)}
              className="h-7 px-2.5 text-xs"
            >
              {response.action.label}
            </Button>
          </div>
        ) : null}
      </AssistantResponseShell>
    )
  }

  if (kind === 'meal_action' && response.mealAction) {
    return (
      <AssistantResponseShell response={response} checkedAt={checkedAt} hero={hero} floating={floating} compact={compact}>
        <MealActionResponseCard
          payload={response.mealAction}
          message={response.message}
          isError={response.state === 'error'}
        />
      </AssistantResponseShell>
    )
  }

  if (
    (kind === 'work_summary' || kind === 'notice' || kind === 'survey') &&
    response.workSummary
  ) {
    return (
      <AssistantResponseShell response={response} checkedAt={checkedAt} hero={hero} floating={floating} compact={compact}>
        <WorkSummaryResponseCard
          payload={response.workSummary}
          message={response.message}
          onNavigate={onAction}
        />
        {!isLoading && resolveActions(response).length > 0 && onAction ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {resolveActions(response).map((action) => (
              <Button
                key={action.path + action.label}
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => onAction(action.path)}
                className="h-7 px-2.5 text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </AssistantResponseShell>
    )
  }

  if (kind === 'unknown' && response.unknown) {
    return (
      <AssistantResponseShell response={response} checkedAt={checkedAt} hero={hero} floating={floating} compact={compact}>
        <UnknownResponseCard
          payload={response.unknown}
          message={response.message}
          onSuggestedQuery={onSuggestedQuery}
        />
      </AssistantResponseShell>
    )
  }

  return (
    <AssistantResponseShell response={response} checkedAt={checkedAt} hero={hero} floating={floating} compact={compact}>
      <GenericResponseBody response={response} onAction={onAction} isLoading={isLoading} />
    </AssistantResponseShell>
  )
}
