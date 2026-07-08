import { useAssistantWorkspace } from './AssistantWorkspaceProvider'
import AddCommandModal from './AddCommandModal'
import AddSearchModal from './AddSearchModal'
import AssistantTabs from './AssistantTabs'
import CommandTab from './CommandTab'
import SearchTab from './SearchTab'

export default function AssistantSavedPanel() {
  const {
    activeTab,
    setActiveTab,
    recentCommands,
    defaultCommands,
    customCommands,
    allSearches,
    commandModalOpen,
    setCommandModalOpen,
    searchModalOpen,
    setSearchModalOpen,
    handleSelectCommand,
    handleSelectSearch,
    handleSaveCommand,
    handleSaveSearch,
    handleDeleteCommand,
    handleDeleteSearch,
  } = useAssistantWorkspace()

  return (
    <>
      <section className="flex h-full min-h-0 flex-col" aria-label="저장된 Assistant 명령">
        <div className="shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Saved Commands
          </p>
          <h2 className="mt-1 text-sm font-bold tracking-tight text-slate-900">
            저장된 명령과 검색
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            자주 쓰는 업무 명령과 검색어를 빠르게 실행할 수 있습니다.
          </p>
          <AssistantTabs active={activeTab} onChange={setActiveTab} />
        </div>

        <div
          className="mt-2 min-h-0 flex-1 overflow-y-auto scrollbar-slim"
          role="tabpanel"
          aria-label={activeTab === 'command' ? '명령' : '검색'}
        >
          {activeTab === 'command' ? (
            <CommandTab
              recentCommands={recentCommands}
              defaultCommands={defaultCommands}
              customCommands={customCommands}
              onAddCommand={() => setCommandModalOpen(true)}
              onSelectCommand={handleSelectCommand}
              onDeleteCommand={handleDeleteCommand}
            />
          ) : (
            <SearchTab
              searches={allSearches}
              onAddSearch={() => setSearchModalOpen(true)}
              onSelectSearch={handleSelectSearch}
              onDeleteSearch={handleDeleteSearch}
            />
          )}
        </div>
      </section>

      <AddCommandModal
        open={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
        onSave={handleSaveCommand}
      />

      <AddSearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSave={handleSaveSearch}
      />
    </>
  )
}
