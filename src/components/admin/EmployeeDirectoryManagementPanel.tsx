import { useCallback, useEffect, useMemo, useState } from 'react'
import { Contact, Pencil, Plus, Search, Trash2, UserX } from 'lucide-react'
import { resolveAdminDataError } from '../../lib/adminDataErrors'
import {
  createEmployee,
  deactivateEmployee,
  deleteEmployee,
  listEmployeesForAdmin,
  updateEmployee,
  type EmployeeDirectoryEntry,
} from '../../services/employeeDirectoryService'
import { Badge, Button, Card, inputClass } from '../ui/primitives'

type EditingState = 'new' | EmployeeDirectoryEntry | null

const EMPTY_FORM = {
  name: '',
  department: '',
  position: '',
  work_email: '',
  extension: '',
  work_phone: '',
  is_active: true,
}

export default function EmployeeDirectoryManagementPanel() {
  const [employees, setEmployees] = useState<EmployeeDirectoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<EditingState>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [tableMissing, setTableMissing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setTableMissing(false)
    try {
      setEmployees(await listEmployeesForAdmin())
    } catch (err) {
      const message = resolveAdminDataError(err, 'employee_directory')
      setError(message)
      if (message.includes('migration')) setTableMissing(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return employees
    return employees.filter((employee) =>
      [employee.name, employee.department, employee.position, employee.work_email]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword)),
    )
  }, [employees, search])

  function openNew() {
    setEditing('new')
    setForm(EMPTY_FORM)
    setError(null)
  }

  function openEdit(employee: EmployeeDirectoryEntry) {
    setEditing(employee)
    setForm({
      name: employee.name,
      department: employee.department ?? '',
      position: employee.position ?? '',
      work_email: employee.work_email ?? '',
      extension: employee.extension ?? '',
      work_phone: employee.work_phone ?? '',
      is_active: employee.is_active,
    })
    setError(null)
  }

  function closeForm() {
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('이름을 입력하세요.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        department: form.department,
        position: form.position,
        work_email: form.work_email,
        extension: form.extension,
        work_phone: form.work_phone,
        is_active: form.is_active,
      }

      if (editing === 'new') {
        await createEmployee(payload)
      } else if (editing) {
        await updateEmployee(editing.id, payload)
      }

      closeForm()
      await load()
    } catch (err) {
      setError(resolveAdminDataError(err, 'employee_directory'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(employee: EmployeeDirectoryEntry) {
    setBusyId(employee.id)
    setError(null)
    try {
      await deactivateEmployee(employee.id)
      await load()
    } catch (err) {
      setError(resolveAdminDataError(err, 'employee_directory'))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(employee: EmployeeDirectoryEntry) {
    if (!window.confirm(`"${employee.name}" 직원을 디렉토리에서 삭제할까요?`)) return

    setBusyId(employee.id)
    setError(null)
    try {
      await deleteEmployee(employee.id)
      await load()
    } catch (err) {
      setError(resolveAdminDataError(err, 'employee_directory'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card className="max-w-5xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <Contact size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">직원 디렉토리</h2>
            <p className="mt-0.5 max-w-xl text-sm text-slate-500">
              Assistant가 직원 정보 질문에 답변할 때 사용하는 공개 업무 연락처입니다.
            </p>
          </div>
        </div>
        {!editing && !tableMissing && (
          <Button type="button" size="sm" onClick={openNew}>
            <Plus size={16} />
            직원 추가
          </Button>
        )}
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {editing ? (
        <div className="space-y-4 px-6 py-6">
          <h3 className="text-sm font-semibold text-slate-900">
            {editing === 'new' ? '직원 추가' : '직원 수정'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-600">이름 *</span>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                placeholder="홍길동"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">부서</span>
              <input
                className={inputClass}
                value={form.department}
                onChange={(e) => setForm((current) => ({ ...current, department: e.target.value }))}
                placeholder="생산관리팀"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">직급</span>
              <input
                className={inputClass}
                value={form.position}
                onChange={(e) => setForm((current) => ({ ...current, position: e.target.value }))}
                placeholder="대리"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">회사 이메일</span>
              <input
                className={inputClass}
                type="email"
                value={form.work_email}
                onChange={(e) => setForm((current) => ({ ...current, work_email: e.target.value }))}
                placeholder="hong@company.com"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">내선</span>
              <input
                className={inputClass}
                value={form.extension}
                onChange={(e) => setForm((current) => ({ ...current, extension: e.target.value }))}
                placeholder="1234"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-600">회사 전화</span>
              <input
                className={inputClass}
                value={form.work_phone}
                onChange={(e) => setForm((current) => ({ ...current, work_phone: e.target.value }))}
                placeholder="031-000-0000"
              />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((current) => ({ ...current, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-line text-brand focus:ring-brand/20"
              />
              <span className="text-sm text-slate-600">Assistant 조회에 표시 (활성)</span>
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeForm}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-line px-6 py-4">
            <div className="relative max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-btn border border-line bg-canvas pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-brand/40 focus:bg-surface focus:ring-4 focus:ring-brand/10"
                placeholder="이름, 부서, 직급, 이메일 검색"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-btn bg-canvas" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">
                {tableMissing ? '직원 디렉토리 테이블이 아직 연결되지 않았습니다.' : '등록된 직원이 없습니다.'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {tableMissing
                  ? 'Supabase migration 적용 후 직원 정보를 추가할 수 있습니다.'
                  : '직원 추가 버튼으로 Assistant 조회용 연락처를 등록하세요.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-line bg-canvas/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">이름</th>
                    <th className="px-3 py-3">부서</th>
                    <th className="px-3 py-3">직급</th>
                    <th className="px-3 py-3">연락처</th>
                    <th className="px-3 py-3">상태</th>
                    <th className="px-6 py-3 text-right">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((employee) => (
                    <tr key={employee.id} className="border-b border-line/70 last:border-0">
                      <td className="px-6 py-3 font-medium text-slate-900">{employee.name}</td>
                      <td className="px-3 py-3 text-slate-600">{employee.department ?? '-'}</td>
                      <td className="px-3 py-3 text-slate-600">{employee.position ?? '-'}</td>
                      <td className="px-3 py-3 text-slate-600">
                        <div className="space-y-0.5">
                          {employee.work_email ? <p>{employee.work_email}</p> : null}
                          {employee.extension ? <p>내선 {employee.extension}</p> : null}
                          {employee.work_phone ? <p>{employee.work_phone}</p> : null}
                          {!employee.work_email && !employee.extension && !employee.work_phone ? (
                            <span>-</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={employee.is_active ? 'success' : 'neutral'}>
                          {employee.is_active ? '활성' : '비활성'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={busyId === employee.id}
                            onClick={() => openEdit(employee)}
                            aria-label="수정"
                          >
                            <Pencil size={15} />
                          </Button>
                          {employee.is_active ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={busyId === employee.id}
                              onClick={() => void handleDeactivate(employee)}
                              aria-label="비활성화"
                            >
                              <UserX size={15} />
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={busyId === employee.id}
                            onClick={() => void handleDelete(employee)}
                            aria-label="삭제"
                            className="text-danger hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
