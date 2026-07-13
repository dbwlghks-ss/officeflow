import {
  BRIEF_EMPTY_SUMMARY,
  buildWorkQueueItems,
  type WorkQueueItemStatus,
} from '../../lib/briefActions'
import { useHomeBriefSnapshot } from '../../hooks/useHomeBriefSnapshot'
import MeetingAnalysisPanel from './meeting/MeetingAnalysisPanel'
import { useAssistantWorkspace } from './assistant/AssistantWorkspaceProvider'
import type { BriefSummaryData } from '../../lib/homeBriefSummary'
import WorkActionButtons from './WorkActionButtons'
import WorkQueueQuickActions from './WorkQueueQuickActions'

type TodayWorkQueueProps = {
  onNavigate?: (path: string) => void
  summary?: Partial<BriefSummaryData>
}

const STATUS_LABEL: Record<WorkQueueItemStatus, string> = {
  action_needed: '필요',
  review: '확인',
  done: '완료',
}

const STATUS_CLASS: Record<WorkQueueItemStatus, string> = {
  action_needed: 'border-amber-200/80 bg-amber-50 text-amber-700',
  review: 'border-slate-200 bg-slate-50 text-slate-600',
  done: 'border-emerald-100 bg-emerald-50/80 text-emerald-700',
}

export default function TodayWorkQueue({ onNavigate, summary }: TodayWorkQueueProps) {
  const { displayMode, summaryData } = useHomeBriefSnapshot({ summary })
  const {
    meetingAnalysisState,
    meetingSaveState,
    updateMeetingActionItems,
    saveMeetingAnalysisResult,
    reanalyzeMeeting,
  } = useAssistantWorkspace()
  const data = summaryData ?? BRIEF_EMPTY_SUMMARY
  const queue = buildWorkQueueItems(data, displayMode)

  return (
    <section className="flex h-full min-h-0 flex-col" aria-label="Today Work Queue">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Today Work Queue
      </p>
      <h2 className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-slate-900 lg:text-xl">
        오늘 처리할 업무
      </h2>
      <p className="mt-1 text-xs text-slate-500">필요한 일은 여기서 바로 처리하세요.</p>

      <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
        <MeetingAnalysisPanel
          analysisState={meetingAnalysisState}
          saveState={meetingSaveState}
          onActionItemsChange={updateMeetingActionItems}
          onSave={() => void saveMeetingAnalysisResult()}
          onReanalyze={() => void reanalyzeMeeting()}
        />

        {displayMode === 'loading' ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[72px] animate-pulse rounded-[14px] border border-line/60 bg-canvas/60"
            />
          ))
        ) : displayMode === 'error' ? (
          <div className="rounded-[14px] border border-line/70 bg-canvas/50 px-3 py-4 text-center">
            <p className="text-sm text-slate-600">업무 목록을 불러오지 못했습니다.</p>
            <p className="mt-1 text-xs text-slate-400">잠시 후 다시 확인해주세요.</p>
          </div>
        ) : displayMode === 'unauthenticated' ? (
          <div className="rounded-[14px] border border-line/70 bg-canvas/50 px-3 py-4 text-center">
            <p className="text-sm text-slate-600">로그인 후 오늘의 업무를 확인할 수 있습니다.</p>
          </div>
        ) : queue.isAllComplete ? (
          <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-line/80 bg-canvas/40 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">오늘 처리할 업무는 없습니다.</p>
            <p className="mt-1 text-xs text-slate-400">필요한 일이 생기면 이곳에 표시됩니다.</p>
          </div>
        ) : (
          queue.items.map((item) => (
            <article
              key={item.id}
              className="rounded-[14px] border border-line/70 bg-surface px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-start gap-2">
                <span
                  className={
                    'mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ' +
                    STATUS_CLASS[item.status]
                  }
                >
                  {STATUS_LABEL[item.status]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-slate-800">{item.message}</p>
                  <div className="mt-2">
                    <WorkActionButtons
                      actions={item.actions}
                      onNavigate={onNavigate}
                      variant="default"
                    />
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {onNavigate ? <WorkQueueQuickActions onNavigate={onNavigate} /> : null}
    </section>
  )
}
