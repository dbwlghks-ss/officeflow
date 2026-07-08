import { AssistantWorkspaceProvider } from './AssistantWorkspaceProvider'
import AskOfficeFlowHero from './AskOfficeFlowHero'
import AssistantSavedPanel from './AssistantSavedPanel'

type AssistantPanelProps = {
  onNavigate?: (path: string) => void
}

/** Legacy full panel wrapper — prefer AskOfficeFlowHero + AssistantSavedPanel on Home. */
export default function AssistantPanel({ onNavigate }: AssistantPanelProps) {
  return (
    <AssistantWorkspaceProvider>
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AskOfficeFlowHero onNavigate={onNavigate} />
        <div className="min-h-0 flex-1 overflow-hidden rounded-[16px] border border-line/60 bg-surface/80 p-2.5">
          <AssistantSavedPanel />
        </div>
      </div>
    </AssistantWorkspaceProvider>
  )
}
