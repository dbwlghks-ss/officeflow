import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  getProfiles,
  updateProfileActive,
  updateProfileRole,
  type Profile,
} from '../../services/userService'

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
    <section className="max-w-4xl rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">사용자 관리</h2>
          <p className="mt-0.5 text-sm text-slate-500">직원 권한과 활성 상태를 관리합니다.</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f]"
          placeholder="이름 또는 이메일 검색"
        />
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="px-6 py-6 text-sm text-slate-500">불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p className="px-6 py-6 text-sm text-slate-600">
          {profiles.length === 0 ? '등록된 사용자가 없습니다.' : '검색 결과가 없습니다.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3">이름</th>
                <th className="px-6 py-3">이메일</th>
                <th className="px-6 py-3">부서</th>
                <th className="px-6 py-3">권한</th>
                <th className="px-6 py-3">활성</th>
                <th className="px-6 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((profile) => (
                <tr key={profile.id}>
                  <td className="px-6 py-3 font-medium text-slate-800">{profile.full_name}</td>
                  <td className="px-6 py-3 text-slate-600">{profile.email}</td>
                  <td className="px-6 py-3 text-slate-600">
                    {profile.department ?? profile.department_name ?? '-'}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={
                        profile.role === 'admin'
                          ? 'rounded bg-[#002c5f]/10 px-2 py-0.5 text-xs font-semibold text-[#002c5f]'
                          : 'rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500'
                      }
                    >
                      {profile.role === 'admin' ? '관리자' : '직원'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={
                        profile.is_active
                          ? 'rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700'
                          : 'rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500'
                      }
                    >
                      {profile.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleRole(profile)}
                        disabled={busyId === profile.id}
                        className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      >
                        {profile.role === 'admin' ? '직원으로' : '관리자로'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(profile)}
                        disabled={busyId === profile.id}
                        className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      >
                        {profile.is_active ? '비활성화' : '활성화'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
