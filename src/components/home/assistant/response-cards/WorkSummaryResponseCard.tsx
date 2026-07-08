import { buildWorkQueueItems } from '../../../../lib/briefActions'
import type { BriefSummaryData } from '../../../../lib/homeBriefSummary'
import type { AssistantWorkSummaryPayload } from '../../../../types/assistant'
import WorkActionButtons from '../../WorkActionButtons'

type WorkSummaryResponseCardProps = {
  payload: AssistantWorkSummaryPayload
  message?: string
  onNavigate?: (path: string) => void
}

function toBriefSummary(payload: AssistantWorkSummaryPayload): BriefSummaryData {
  return {
    mealStatusLabel: payload.mealStatusLabel,
    mealApplied: payload.mealApplied,
    mealDeclined: payload.mealDeclined,
    mealServiceAvailable: payload.mealServiceAvailable,
    unreadNoticeCount: payload.unreadNoticeCount,
    pendingSurveyCount: payload.pendingSurveyCount,
    todayScheduleCount: 0,
  }
}

export default function WorkSummaryResponseCard({
  payload,
  message,
  onNavigate,
}: WorkSummaryResponseCardProps) {
  if (payload.variant === 'notices' && payload.unreadNoticeCount === 0) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-line/80 bg-canvas/40 px-4 py-4 text-center">
        <p className="text-sm text-slate-600">{message ?? '읽지 않은 공지가 없습니다.'}</p>
      </div>
    )
  }

  if (payload.variant === 'surveys' && payload.pendingSurveyCount === 0) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-line/80 bg-canvas/40 px-4 py-4 text-center">
        <p className="text-sm text-slate-600">{message ?? '참여 대기 중인 설문이 없습니다.'}</p>
      </div>
    )
  }

  const queue = buildWorkQueueItems(toBriefSummary(payload), 'ready')

  return (
    <div className="mt-3 space-y-2">
      {message && payload.variant === 'summary' ? (
        <p className="text-xs leading-relaxed text-slate-500">{message}</p>
      ) : null}

      {payload.variant === 'notices' && payload.noticeTitles && payload.noticeTitles.length > 0 ? (
        <ul className="m-0 list-none space-y-1 rounded-xl border border-line/70 bg-surface p-3">
          {payload.noticeTitles.slice(0, 3).map((title) => (
            <li key={title} className="text-xs leading-relaxed text-slate-700">
              · {title}
            </li>
          ))}
        </ul>
      ) : null}

      {payload.variant === 'surveys' && payload.surveyTitles && payload.surveyTitles.length > 0 ? (
        <ul className="m-0 list-none space-y-1 rounded-xl border border-line/70 bg-surface p-3">
          {payload.surveyTitles.slice(0, 3).map((title) => (
            <li key={title} className="text-xs leading-relaxed text-slate-700">
              · {title}
            </li>
          ))}
        </ul>
      ) : null}

      {queue.isAllComplete ? (
        <div className="rounded-xl border border-dashed border-line/80 bg-canvas/40 px-4 py-4 text-center">
          <p className="text-sm text-slate-600">오늘 처리할 업무는 없습니다.</p>
        </div>
      ) : (
        queue.items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-line/70 bg-surface px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <p className="text-xs leading-relaxed text-slate-700">{item.message}</p>
            <div className="mt-2">
              <WorkActionButtons actions={item.actions} onNavigate={onNavigate} variant="default" />
            </div>
          </article>
        ))
      )}
    </div>
  )
}
