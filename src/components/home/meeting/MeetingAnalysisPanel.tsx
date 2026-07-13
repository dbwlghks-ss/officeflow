import { Loader2, RotateCcw, Save } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../../ui/primitives'
import type {
  MeetingActionItem,
  MeetingActionPriority,
  MeetingAnalysisResult,
  MeetingAnalysisState,
  MeetingSaveState,
} from '../../../types/meeting'

type MeetingAnalysisPanelProps = {
  analysisState: MeetingAnalysisState
  saveState: MeetingSaveState
  onActionItemsChange: (items: MeetingActionItem[]) => void
  onSave: () => void
  onReanalyze: () => void
}

const PRIORITY_LABEL: Record<MeetingActionPriority, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
}

const PRIORITY_CLASS: Record<MeetingActionPriority, string> = {
  high: 'bg-red-50 text-red-700',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

function needsReview(item: MeetingActionItem): boolean {
  return !item.owner_name?.trim() || (!item.due_label?.trim() && !item.due_date)
}

function needsDateReview(item: MeetingActionItem): boolean {
  return Boolean(item.due_label?.trim()) && !item.due_date
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[14px] border border-line/70 bg-canvas/35 px-3 py-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function ActionItemsEditor({
  items,
  onChange,
}: {
  items: MeetingActionItem[]
  onChange: (items: MeetingActionItem[]) => void
}) {
  function updateItem(index: number, patch: Partial<MeetingActionItem>) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">추출된 업무가 없습니다.</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <article
          key={`${item.task_title}-${index}`}
          className="rounded-[12px] border border-line/70 bg-surface px-3 py-3"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_CLASS[item.priority]}`}
            >
              {PRIORITY_LABEL[item.priority]}
            </span>
            {needsDateReview(item) ? (
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                날짜 확인 필요
              </span>
            ) : null}
            {needsReview(item) ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                확인 필요
              </span>
            ) : null}
          </div>

          <label className="block text-[11px] font-medium text-slate-500">업무</label>
          <input
            value={item.task_title}
            onChange={(event) => updateItem(index, { task_title: event.target.value })}
            className="mt-1 w-full rounded-btn border border-line bg-white px-2.5 py-1.5 text-sm text-slate-800"
          />

          <label className="mt-2 block text-[11px] font-medium text-slate-500">설명</label>
          <textarea
            value={item.description}
            onChange={(event) => updateItem(index, { description: event.target.value })}
            rows={2}
            className="mt-1 w-full resize-y rounded-btn border border-line bg-white px-2.5 py-1.5 text-sm text-slate-800"
          />

          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500">담당</label>
              <input
                value={item.owner_name ?? ''}
                onChange={(event) =>
                  updateItem(index, { owner_name: event.target.value.trim() || null })
                }
                className="mt-1 w-full rounded-btn border border-line bg-white px-2.5 py-1.5 text-sm"
                placeholder="미정"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500">마감 표현</label>
              <input
                value={item.due_label ?? ''}
                onChange={(event) =>
                  updateItem(index, { due_label: event.target.value.trim() || null })
                }
                className="mt-1 w-full rounded-btn border border-line bg-white px-2.5 py-1.5 text-sm"
                placeholder="예: 다음 주 금요일"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500">우선순위</label>
              <select
                value={item.priority}
                onChange={(event) =>
                  updateItem(index, { priority: event.target.value as MeetingActionPriority })
                }
                className="mt-1 w-full rounded-btn border border-line bg-white px-2.5 py-1.5 text-sm"
              >
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>
            </div>
          </div>

          {item.evidence_text ? (
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              근거: {item.evidence_text}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  )
}

function AnalysisContent({
  result,
  actionItems,
  onActionItemsChange,
}: {
  result: MeetingAnalysisResult
  actionItems: MeetingActionItem[]
  onActionItemsChange: (items: MeetingActionItem[]) => void
}) {
  return (
    <div className="space-y-3">
      <SectionCard title="회의 요약">
        <p className="text-sm leading-relaxed text-slate-700">{result.summary}</p>
      </SectionCard>

      <SectionCard title="주요 결정사항">
        {result.decisions.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
            {result.decisions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">추출된 결정사항이 없습니다.</p>
        )}
      </SectionCard>

      <SectionCard title="리스크">
        {result.risks.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
            {result.risks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">확인된 리스크가 없습니다.</p>
        )}
      </SectionCard>

      <SectionCard title="업무 지시">
        <ActionItemsEditor items={actionItems} onChange={onActionItemsChange} />
      </SectionCard>

      <SectionCard title="후속 확인 질문">
        {result.follow_up_questions.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
            {result.follow_up_questions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">추가 확인 질문이 없습니다.</p>
        )}
      </SectionCard>
    </div>
  )
}

export default function MeetingAnalysisPanel({
  analysisState,
  saveState,
  onActionItemsChange,
  onSave,
  onReanalyze,
}: MeetingAnalysisPanelProps) {
  if (analysisState.status === 'idle' && saveState.status === 'idle') {
    return null
  }

  if (saveState.status === 'saved') {
    return (
      <div className="rounded-[14px] border border-emerald-100 bg-emerald-50/70 px-3 py-3">
        <p className="text-sm font-medium text-emerald-800">
          회의록에서 추출된 업무 {saveState.actionItemCount}건이 저장되었습니다.
        </p>
      </div>
    )
  }

  if (analysisState.status === 'loading') {
    return (
      <div className="flex items-center gap-2 rounded-[14px] border border-line/70 bg-canvas/40 px-3 py-4 text-sm text-slate-600">
        <Loader2 size={16} className="animate-spin text-brand" aria-hidden="true" />
        회의록 분석 중...
      </div>
    )
  }

  if (analysisState.status === 'error') {
    return (
      <div className="space-y-3 rounded-[14px] border border-line/70 bg-canvas/40 px-3 py-4">
        <p className="text-sm font-medium text-slate-700">
          {analysisState.message || 'AI 분석 서버에서 오류가 발생했습니다. Supabase Edge Function 로그를 확인해주세요.'}
        </p>
        <p className="text-xs text-slate-500">
          입력 내용을 조금 더 명확히 한 뒤 다시 분석할 수 있습니다.
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={onReanalyze}>
          <RotateCcw size={14} />
          다시 분석하기
        </Button>
      </div>
    )
  }

  if (analysisState.status !== 'ready') {
    return null
  }

  const result = analysisState.result

  return (
    <div className="space-y-3 rounded-[14px] border border-brand/15 bg-brand-light/20 px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand/80">
            Meeting Analysis
          </p>
          <h3 className="mt-1 text-sm font-semibold text-slate-900">회의록 분석 결과</h3>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={onReanalyze}>
          <RotateCcw size={14} />
          다시 분석하기
        </Button>
      </div>

      <AnalysisContent
        result={result}
        actionItems={result.action_items}
        onActionItemsChange={onActionItemsChange}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={saveState.status === 'saving'}
        >
          {saveState.status === 'saving' ? (
            <>
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              저장 중...
            </>
          ) : (
            <>
              <Save size={14} />
              업무로 저장하기
            </>
          )}
        </Button>
      </div>

      {saveState.status === 'error' ? (
        <p className="text-xs text-danger" role="alert">
          업무 저장에 실패했습니다. Supabase 연결과 권한을 확인해주세요.
        </p>
      ) : null}
    </div>
  )
}
