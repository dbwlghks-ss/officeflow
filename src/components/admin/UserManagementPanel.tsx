import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, ShieldCheck, User as UserIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import {
  getProfiles,
  updateProfileActive,
  updateProfileRole,
  type Profile,
} from '../../services/userService'
import { Badge, Button, Card } from '../ui/primitives'

export default function UserManagementPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProfiles(await getProfiles())
    } catch {
      setError('사용자 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
    })
  }, [load])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return profiles
    return profiles.filter(
      (p) =>
        p.full_name.toLowerCase().includes(keyword) || p.email.toLowerCase().includes(keyword),
    )
  }, [profiles, search])

  async function handleToggleRole(profile: Profile) {
    const nextRole = profile.role === 'admin' ? 'employee' : 'admin'

    if (profile.role === 'admin' && nextRole === 'employee') {
      const adminCount = profiles.filter((p) => p.role === 'admin').length
      if (adminCount <= 1) {
        setError('마지막 관리자는 변경할 수 없습니다.')
        return
      }
    }

    setBusyId(profile.id)
    setError(null)
    try {
      await updateProfileRole(profile.id, nextRole)
      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, role: nextRole } : p)),
      )
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
      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, is_active: nextActive } : p)),
      )
    } catch {
      setError('활성 상태 변경에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">사용자 관리</h2>
          <p className="mt-0.5 text-sm text-slate-500">직원 권한과 활성 상태를 관리합니다.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-btn border border-line bg-canvas pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-brand/40 focus:bg-surface focus:ring-4 focus:ring-brand/10"
            placeholder="이름 또는 이메일 검색"
          />
        </div>
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {loading ? (
        <div className="space-y-3 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-btn bg-slate-100/70" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <UserIcon size={22} />
          </div>
          <p className="text-sm font-medium text-slate-600">
            {profiles.length === 0 ? '등록된 사용자가 없습니다.' : '검색 결과가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3 font-semibold">이름</th>
                <th className="px-6 py-3 font-semibold">이메일</th>
                <th className="px-6 py-3 font-semibold">부서</th>
                <th className="px-6 py-3 font-semibold">권한</th>
                <th className="px-6 py-3 font-semibold">상태</th>
                <th className="px-6 py-3 text-right font-semibold">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((profile) => (
                <tr key={profile.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-light text-xs font-bold text-brand">
                        {profile.full_name?.charAt(0) ?? '·'}
                      </div>
                      <span className="font-medium text-slate-800">{profile.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{profile.email}</td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {profile.department ?? profile.department_name ?? '-'}
                  </td>
                  <td className="px-6 py-3.5">
                    {profile.role === 'admin' ? (
                      <Badge tone="brand">
                        <ShieldCheck size={12} />
                        관리자
                      </Badge>
                    ) : (
                      <Badge tone="neutral">직원</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    {profile.is_active ? (
                      <Badge tone="success">활성</Badge>
                    ) : (
                      <Badge tone="neutral">비활성</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleRole(profile)}
                        disabled={busyId === profile.id}
                      >
                        {profile.role === 'admin' ? '직원으로' : '관리자로'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(profile)}
                        disabled={busyId === profile.id}
                      >
                        {profile.is_active ? '비활성화' : '활성화'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
