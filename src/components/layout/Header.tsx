import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

type AuthUser = { name: string; position: string | null }

export default function Header() {
  const navigate = useNavigate()
  const [authUser, setAuthUser] = useState<AuthUser | null | undefined>(undefined)

  useEffect(() => {
    let active = true

    async function resolveProfile(userId: string, fallback: string | null) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, position')
        .eq('id', userId)
        .maybeSingle()
      if (active) {
        setAuthUser({
          name: data?.full_name ?? fallback ?? '사용자',
          position: data?.position ?? null,
        })
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const user = data.session?.user
      if (user) {
        resolveProfile(user.id, user.email ?? null)
      } else {
        setAuthUser(null)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const user = session?.user
      if (user) {
        resolveProfile(user.id, user.email ?? null)
      } else {
        setAuthUser(null)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#002c5f]">
            <span className="text-sm font-bold text-white">OF</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#002c5f]">OfficeFlow</span>
        </div>

        <div className="flex items-center gap-6">
          <time className="hidden text-sm text-slate-500 sm:block">{today}</time>
          {authUser ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">
                {authUser.name}
                {authUser.position && (
                  <span className="ml-1.5 text-slate-400">{authUser.position}</span>
                )}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded border border-[#002c5f] px-4 py-1.5 text-sm font-medium text-[#002c5f] transition-colors hover:bg-[#002c5f] hover:text-white"
              >
                로그아웃
              </button>
            </div>
          ) : authUser === null ? (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded border border-[#002c5f] px-4 py-1.5 text-sm font-medium text-[#002c5f] transition-colors hover:bg-[#002c5f] hover:text-white"
            >
              로그인
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
