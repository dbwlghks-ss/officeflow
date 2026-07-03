import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Header() {
  const navigate = useNavigate()
  const [authName, setAuthName] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    let active = true

    async function resolveName(userId: string, fallback: string | null) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle()
      if (active) setAuthName(data?.full_name ?? fallback ?? '사용자')
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const user = data.session?.user
      if (user) {
        resolveName(user.id, user.email ?? null)
      } else {
        setAuthName(null)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const user = session?.user
      if (user) {
        resolveName(user.id, user.email ?? null)
      } else {
        setAuthName(null)
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
          {authName ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">{authName}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded border border-[#002c5f] px-4 py-1.5 text-sm font-medium text-[#002c5f] transition-colors hover:bg-[#002c5f] hover:text-white"
              >
                로그아웃
              </button>
            </div>
          ) : authName === null ? (
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
