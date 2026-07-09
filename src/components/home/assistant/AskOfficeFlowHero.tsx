import { useEffect, useRef, useState } from 'react'
import { useAssistantWorkspace } from './AssistantWorkspaceProvider'
import AssistantHeroSearch from './AssistantHeroSearch'
import SavedCommandsMenu from './SavedCommandsMenu'
import AssistantFloatingResult from './AssistantFloatingResult'

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
    clearResponse,
  } = useAssistantWorkspace()

  const [savedOpen, setSavedOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const isLoading = response?.state === 'loading'

  async function submitQuery() {
    setSavedOpen(false)
    await handleDirectQuery()
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return

      if (savedOpen) {
        setSavedOpen(false)
        return
      }

      if (response) {
        clearResponse()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [savedOpen, response, clearResponse])

  useEffect(() => {
    if (!response && !savedOpen) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (anchorRef.current?.contains(target)) return

      setSavedOpen(false)
      if (response) clearResponse()
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [response, savedOpen, clearResponse])

  return (
    <section
      id="ask-officeflow"
      className="mx-auto w-full max-w-3xl px-1 lg:max-w-4xl"
      aria-label="Ask OfficeFlow"
    >
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-brand/80">
        Ask OfficeFlow
      </p>

      <div ref={anchorRef} className="relative mt-3">
        <SavedCommandsMenu
          open={savedOpen}
          onOpenChange={(next) => {
            if (next) clearResponse()
            setSavedOpen(next)
          }}
          searchSlot={
            <AssistantHeroSearch
              value={directQuery}
              onChange={setDirectQuery}
              onSubmit={() => void submitQuery()}
              loading={isLoading}
            />
          }
        />

        {response ? (
          <AssistantFloatingResult
            response={response}
            checkedAt={checkedAt}
            resultRef={resultRef}
            onClose={clearResponse}
            onAction={onNavigate}
            onSuggestedQuery={(query) => {
              setSavedOpen(false)
              void handleSuggestedQuery(query)
            }}
          />
        ) : null}
      </div>
    </section>
  )
}
