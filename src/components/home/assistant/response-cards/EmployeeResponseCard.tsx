import { Building2, Mail, Phone } from 'lucide-react'
import { displayOrFallback } from '../../../../lib/assistantResponsePayload'
import type { AssistantEmployeePayload } from '../../../../types/assistant'

type EmployeeResponseCardProps = {
  payload: AssistantEmployeePayload
}

function EmployeeContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2 text-xs text-slate-600">
      <Icon size={14} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0">
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</span>
        <p className="mt-0.5 leading-relaxed break-all">{value}</p>
      </div>
    </div>
  )
}

function EmployeeCard({ employee }: { employee: AssistantEmployeePayload['employees'][number] }) {
  const department = displayOrFallback(employee.department)
  const position = displayOrFallback(employee.position)
  const extension = displayOrFallback(employee.extension)
  const workPhone = displayOrFallback(employee.workPhone)
  const workEmail = displayOrFallback(employee.workEmail)

  return (
    <article className="rounded-xl border border-line/70 bg-surface px-3.5 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <h3 className="text-base font-semibold tracking-tight text-slate-900">{employee.name}</h3>
      <p className="mt-0.5 text-sm text-slate-500">
        {department}
        {department !== '등록된 정보가 없습니다' && position !== '등록된 정보가 없습니다'
          ? ` · ${position}`
          : position !== '등록된 정보가 없습니다'
            ? position
            : ''}
      </p>

      <div className="mt-3 space-y-2.5 border-t border-line/60 pt-3">
        <EmployeeContactRow icon={Phone} label="내선" value={extension} />
        <EmployeeContactRow icon={Building2} label="회사전화" value={workPhone} />
        <EmployeeContactRow icon={Mail} label="이메일" value={workEmail} />
      </div>
    </article>
  )
}

export default function EmployeeResponseCard({ payload }: EmployeeResponseCardProps) {
  if (payload.empty || payload.employees.length === 0) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-line/80 bg-canvas/40 px-4 py-5 text-center">
        <p className="text-sm text-slate-600">조회 가능한 직원 정보를 찾지 못했습니다.</p>
        <p className="mt-1 text-xs text-slate-400">이름을 확인하거나 다른 표현으로 다시 질문해보세요.</p>
      </div>
    )
  }

  if (payload.employees.length > 1) {
    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs leading-relaxed text-slate-500">
          {payload.query
            ? `"${payload.query}" 검색 결과가 ${payload.employees.length}건 있습니다. 더 구체적으로 입력해주세요.`
            : '여러 명이 검색되었습니다. 더 구체적으로 입력해주세요.'}
        </p>
        {payload.employees.slice(0, 3).map((employee) => (
          <EmployeeCard key={employee.name} employee={employee} />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-3">
      <EmployeeCard employee={payload.employees[0]} />
    </div>
  )
}
