import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  UserX,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { resolveAdminDataError } from '../../lib/adminDataErrors'
import {
  createEmployee,
  deactivateEmployee,
  deleteEmployee,
  listEmployeesForAdmin,
  updateEmployee,
  type EmployeeDirectoryEntry,
} from '../../services/employeeDirectoryService'
import {
  getProfiles,
  updateProfileActive,
  updateProfileRole,
  type Profile,
} from '../../services/userService'
import { Badge, Button, Card, inputClass } from '../ui/primitives'

type FilterKey = 'all' | 'active' | 'inactive' | 'assistant' | 'manual'

type UserDirectoryRow = {
  key: string
  profile: Profile | null
  directory: EmployeeDirectoryEntry | null
  source: 'auto' | 'manual'
}

type EditTarget =
  | { kind: 'profile'; profile: Profile; directory: EmployeeDirectoryEntry | null }
  | { kind: 'manual'; directory: EmployeeDirectoryEntry }
  | { kind: 'new-manual' }

const EMPTY_DIRECTORY_FORM = {
  name: '',
  department: '',
  position: '',
  work_email: '',
  extension: '',
  work_phone: '',
  is_active: true,
}

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '활성' },
  { key: 'inactive', label: '비활성' },
  { key: 'assistant', label: 'Assistant 공개' },
  { key: 'manual', label: '수동 등록' },
]

function buildRows(profiles: Profile[], employees: EmployeeDirectoryEntry[]): UserDirectoryRow[] {
  const directoryByProfileId = new Map<string, EmployeeDirectoryEntry>()
  const manualEmployees: EmployeeDirectoryEntry[] = []

  for (const employee of employees) {
    if (employee.profile_id) {
      directoryByProfileId.set(employee.profile_id, employee)
    } else {
      manualEmployees.push(employee)
    }
  }

  const profileRows: UserDirectoryRow[] = profiles.map((profile) => ({
    key: `profile-${profile.id}`,
    profile,
    directory: directoryByProfileId.get(profile.id) ?? null,
    source: 'auto',
  }))

  const manualRows: UserDirectoryRow[] = manualEmployees.map((directory) => ({
    key: `manual-${directory.id}`,
    profile: null,
    directory,
    source: 'manual',
  }))

  return [...profileRows, ...manualRows]
}

function formatContact(directory: EmployeeDirectoryEntry | null): string {
  if (!directory) return '-'
  const parts: string[] = []
  if (directory.extension?.trim()) parts.push(`내선 ${directory.extension.trim()}`)
  if (directory.work_phone?.trim()) parts.push(directory.work_phone.trim())
  return parts.length > 0 ? parts.join(' · ') : '-'
}

export default function UserManagementPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [employees, setEmployees] = useState<EmployeeDirectoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [tableMissing, setTableMissing] = useState(false)
  const [editing, setEditing] = useState<EditTarget | null>(null)
  const [form, setForm] = useState(EMPTY_DIRECTORY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setTableMissing(false)

    let nextProfiles: Profile[] = []
    try {
      nextProfiles = await getProfiles()
    } catch {
      setError('사용자 목록을 불러오지 못했습니다.')
      setProfiles([])
      setEmployees([])
      setLoading(false)
      return
    }

    setProfiles(nextProfiles)

    try {
      setEmployees(await listEmployeesForAdmin())
    } catch (err) {
      const message = resolveAdminDataError(err, 'employee_directory')
      setEmployees([])
      if (message.includes('migration')) {
        setTableMissing(true)
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
    })
  }, [load])

  const rows = useMemo(() => buildRows(profiles, employees), [profiles, employees])

  const summary = useMemo(
    () => ({
      totalUsers: profiles.length,
      activeUsers: profiles.filter((profile) => profile.is_active).length,
      assistantPublic: employees.filter((employee) => employee.is_active).length,
    }),
    [profiles, employees],
  )

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return rows.filter((row) => {
      const name = row.profile?.full_name ?? row.directory?.name ?? ''
      const email = row.profile?.email ?? row.directory?.work_email ?? ''
      const department =
        row.profile?.department ??
        row.profile?.department_name ??
        row.directory?.department ??
        ''
      const position = row.profile?.position ?? row.directory?.position ?? ''

      if (keyword) {
        const haystack = [name, email, department, position].join(' ').toLowerCase()
        if (!haystack.includes(keyword)) return false
      }

      if (filter === 'active' && !(row.profile?.is_active ?? false)) return false
      if (filter === 'inactive' && (row.profile?.is_active ?? true)) return false
      if (filter === 'assistant' && !(row.directory?.is_active ?? false)) return false
      if (filter === 'manual' && row.source !== 'manual') return false

      return true
    })
  }, [rows, search, filter])

  function openNewManual() {
    setEditing({ kind: 'new-manual' })
    setForm(EMPTY_DIRECTORY_FORM)
    setError(null)
  }

  function openEditRow(row: UserDirectoryRow) {
    if (row.source === 'manual' && row.directory) {
      setEditing({ kind: 'manual', directory: row.directory })
      setForm({
        name: row.directory.name,
        department: row.directory.department ?? '',
        position: row.directory.position ?? '',
        work_email: row.directory.work_email ?? '',
        extension: row.directory.extension ?? '',
        work_phone: row.directory.work_phone ?? '',
        is_active: row.directory.is_active,
      })
    } else if (row.profile) {
      setEditing({ kind: 'profile', profile: row.profile, directory: row.directory })
      setForm({
        name: row.profile.full_name,
        department: row.profile.department ?? row.profile.department_name ?? '',
        position: row.profile.position ?? '',
        work_email: row.directory?.work_email ?? row.profile.email,
        extension: row.directory?.extension ?? '',
        work_phone: row.directory?.work_phone ?? '',
        is_active: row.directory?.is_active ?? false,
      })
    }
    setError(null)
  }

  function closeForm() {
    setEditing(null)
    setForm(EMPTY_DIRECTORY_FORM)
  }

  async function handleToggleRole(profile: Profile) {
    const nextRole = profile.role === 'admin' ? 'employee' : 'admin'

    if (profile.role === 'admin' && nextRole === 'employee') {
      const adminCount = profiles.filter((item) => item.role === 'admin').length
      if (adminCount <= 1) {
        setError('마지막 관리자는 변경할 수 없습니다.')
        return
      }
    }

    setBusyId(profile.id)
    setError(null)
    try {
      await updateProfileRole(profile.id, nextRole)
      await load()
    } catch {
      setError('권한 변경에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleToggleActive(profile: Profile) {
    const nextActive = !profile.is_active

    if (!nextActive && profile.id === currentUserId) {
      setError('현재 로그인한 관리자는 비활성화할 수 없습니다.')
      return
    }

    setBusyId(profile.id)
    setError(null)
    try {
      await updateProfileActive(profile.id, nextActive)
      await load()
    } catch {
      setError('활성 상태 변경에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleSave() {
    if (!editing) return

    if (editing.kind === 'new-manual' || editing.kind === 'manual') {
      if (!form.name.trim()) {
        setError('이름을 입력하세요.')
        return
      }
    }

    if (editing.kind === 'profile' && !editing.directory) {
      setError('Assistant 공개 연락처가 아직 생성되지 않았습니다. migration 적용 후 다시 시도하세요.')
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

      if (editing.kind === 'new-manual') {
        await createEmployee(payload)
      } else if (editing.kind === 'manual') {
        await updateEmployee(editing.directory.id, payload)
      } else if (editing.kind === 'profile' && editing.directory) {
        await updateEmployee(editing.directory.id, payload, { profileId: editing.profile.id })
      }

      closeForm()
      await load()
    } catch (err) {
      setError(resolveAdminDataError(err, 'employee_directory'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivateDirectory(directory: EmployeeDirectoryEntry) {
    setBusyId(directory.id)
    setError(null)
    try {
      await deactivateEmployee(directory.id)
      await load()
    } catch (err) {
      setError(resolveAdminDataError(err, 'employee_directory'))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDeleteDirectory(directory: EmployeeDirectoryEntry) {
    if (!window.confirm(`"${directory.name}" 연락처를 삭제할까요?`)) return

    setBusyId(directory.id)
    setError(null)
    try {
      await deleteEmployee(directory.id)
      await load()
    } catch (err) {
      setError(resolveAdminDataError(err, 'employee_directory'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">사용자 관리</h2>
            <p className="mt-0.5 max-w-2xl text-sm text-slate-500">
              임직원 계정과 Ask OfficeFlow가 사용하는 Assistant 공개 연락처를 함께 관리합니다.
            </p>
          </div>
          {!editing && !tableMissing ? (
            <Button type="button" size="sm" onClick={openNewManual}>
              <Plus size={16} />
              연락처 추가
            </Button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-btn border border-line bg-canvas/50 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">전체 사용자</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{summary.totalUsers}</p>
          </div>
          <div className="rounded-btn border border-line bg-canvas/50 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">활성 사용자</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{summary.activeUsers}</p>
          </div>
          <div className="rounded-btn border border-line bg-canvas/50 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">Assistant 공개 연락처</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{summary.assistantPublic}</p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mx-6 mt-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
      ) : null}

      {tableMissing ? (
        <p className="mx-6 mt-4 rounded-btn bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Assistant 공개 연락처 테이블이 아직 적용되지 않았습니다. Supabase migration을 먼저 적용하세요.
        </p>
      ) : null}

      {editing ? (
        <div className="space-y-4 px-6 py-6">
          <h3 className="text-sm font-semibold text-slate-900">
            {editing.kind === 'new-manual'
              ? '수동 연락처 추가'
              : editing.kind === 'manual'
                ? '수동 연락처 수정'
                : '사용자 및 Assistant 공개 연락처'}
          </h3>

          {editing.kind === 'profile' ? (
            <div className="rounded-btn border border-line bg-canvas/40 px-4 py-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">{editing.profile.full_name}</span>
                <span className="mx-2 text-slate-300">·</span>
                {editing.profile.email}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={busyId === editing.profile.id}
                  onClick={() => void handleToggleRole(editing.profile)}
                >
                  {editing.profile.role === 'admin' ? '직원 권한으로' : '관리자 권한으로'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busyId === editing.profile.id}
                  onClick={() => void handleToggleActive(editing.profile)}
                >
                  {editing.profile.is_active ? '계정 비활성화' : '계정 활성화'}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {(editing.kind === 'new-manual' || editing.kind === 'manual') && (
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-slate-600">이름 *</span>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="홍길동"
                />
              </label>
            )}
            {(editing.kind === 'new-manual' || editing.kind === 'manual') && (
              <>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">부서</span>
                  <input
                    className={inputClass}
                    value={form.department}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, department: event.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">직급</span>
                  <input
                    className={inputClass}
                    value={form.position}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, position: event.target.value }))
                    }
                  />
                </label>
              </>
            )}
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-600">회사 이메일</span>
              <input
                className={inputClass}
                type="email"
                value={form.work_email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, work_email: event.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">내선</span>
              <input
                className={inputClass}
                value={form.extension}
                onChange={(event) =>
                  setForm((current) => ({ ...current, extension: event.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">회사 전화</span>
              <input
                className={inputClass}
                value={form.work_phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, work_phone: event.target.value }))
                }
              />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((current) => ({ ...current, is_active: event.target.checked }))
                }
                className="h-4 w-4 rounded border-line text-brand focus:ring-brand/20"
              />
              <span className="text-sm text-slate-600">Assistant 조회에 공개</span>
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
          <div className="space-y-3 border-b border-line px-6 py-4">
            <div className="relative max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-btn border border-line bg-canvas pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-brand/40 focus:bg-surface focus:ring-4 focus:ring-brand/10"
                placeholder="이름, 이메일, 부서 검색"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setFilter(option.key)}
                  className={
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
                    (filter === option.key
                      ? 'border-brand/30 bg-brand-light text-brand'
                      : 'border-line bg-surface text-slate-500 hover:border-brand/20 hover:text-brand')
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-btn bg-slate-100/70" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                <UserIcon size={22} />
              </div>
              <p className="text-sm font-medium text-slate-600">
                {rows.length === 0
                  ? '등록된 사용자가 없습니다.'
                  : '검색 결과가 없습니다.'}
              </p>
              {rows.length === 0 ? (
                <p className="mt-1 text-sm text-slate-500">
                  회원가입 또는 연락처 추가 후 Assistant 공개 연락처가 생성됩니다.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-slate-50/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-3">이름</th>
                    <th className="px-3 py-3">부서</th>
                    <th className="px-3 py-3">직급</th>
                    <th className="px-3 py-3">이메일</th>
                    <th className="px-3 py-3">역할</th>
                    <th className="px-3 py-3">상태</th>
                    <th className="px-3 py-3">Assistant</th>
                    <th className="px-3 py-3">연락처</th>
                    <th className="px-3 py-3">소스</th>
                    <th className="px-6 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((row) => {
                    const name = row.profile?.full_name ?? row.directory?.name ?? '-'
                    const email = row.profile?.email ?? row.directory?.work_email ?? '-'
                    const department =
                      row.profile?.department ??
                      row.profile?.department_name ??
                      row.directory?.department ??
                      '-'
                    const position = row.profile?.position ?? row.directory?.position ?? '-'
                    const rowBusyId = row.directory?.id ?? row.profile?.id ?? row.key

                    return (
                      <tr key={row.key} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-6 py-3.5 font-medium text-slate-800">{name}</td>
                        <td className="px-3 py-3.5 text-slate-500">{department}</td>
                        <td className="px-3 py-3.5 text-slate-500">{position}</td>
                        <td className="px-3 py-3.5 text-slate-500">{email}</td>
                        <td className="px-3 py-3.5">
                          {row.profile?.role === 'admin' ? (
                            <Badge tone="brand">
                              <ShieldCheck size={12} />
                              관리자
                            </Badge>
                          ) : row.profile ? (
                            <Badge tone="neutral">직원</Badge>
                          ) : (
                            <span className="text-xs text-slate-400">계정 없음</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          {row.profile ? (
                            row.profile.is_active ? (
                              <Badge tone="success">활성</Badge>
                            ) : (
                              <Badge tone="neutral">비활성</Badge>
                            )
                          ) : (
                            <Badge tone="neutral">계정 없음</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          {row.directory?.is_active ? (
                            <Badge tone="success">공개</Badge>
                          ) : (
                            <Badge tone="neutral">비공개</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-slate-500">{formatContact(row.directory)}</td>
                        <td className="px-3 py-3.5">
                          <Badge tone={row.source === 'auto' ? 'brand' : 'neutral'}>
                            {row.source === 'auto' ? '자동' : '수동'}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={busyId === rowBusyId}
                              onClick={() => openEditRow(row)}
                              aria-label="수정"
                            >
                              <Pencil size={15} />
                            </Button>
                            {row.profile ? (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={busyId === row.profile.id}
                                  onClick={() => void handleToggleRole(row.profile!)}
                                >
                                  {row.profile.role === 'admin' ? '직원' : '관리자'}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={busyId === row.profile.id}
                                  onClick={() => void handleToggleActive(row.profile!)}
                                >
                                  {row.profile.is_active ? '비활성' : '활성'}
                                </Button>
                              </>
                            ) : null}
                            {row.directory && row.directory.is_active ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={busyId === row.directory.id}
                                onClick={() => void handleDeactivateDirectory(row.directory!)}
                                aria-label="연락처 비활성화"
                              >
                                <UserX size={15} />
                              </Button>
                            ) : null}
                            {row.source === 'manual' && row.directory ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={busyId === row.directory.id}
                                onClick={() => void handleDeleteDirectory(row.directory!)}
                                aria-label="삭제"
                                className="text-danger hover:bg-red-50"
                              >
                                <Trash2 size={15} />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
