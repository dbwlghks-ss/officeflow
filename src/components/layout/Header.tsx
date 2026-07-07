import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogIn, LogOut, Settings } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getNotificationUnreadCount } from '../../lib/recentUpdatesMockData'
import NotificationCenter from '../notifications/NotificationCenter'
import { HeaderBrandLockup } from '../ui/Logo'
import { Button } from '../ui/primitives'

type AuthUser = { name: string; position: string | null; role: string | null }

export default function Header() {
  const navigate = useNavigate()
  const [authUser, setAuthUser] = useState<AuthUser | null | undefined>(undefined)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const unreadCount = getNotificationUnreadCount()

  useEffect(() => {
    let active = true

    async function resolveProfile(userId: string, fallback: string | null) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, position, role')
        .eq('id', userId)
        .maybeSingle()
      if (active) {
        setAuthUser({
          name: data?.full_name ?? fallback ?? '사용자',
          position: data?.position ?? null,
          role: data?.role ?? null,
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

  useEffect(() => {
    if (!notificationsOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setNotificationsOpen(false)
    }

    function handlePointerDown(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [notificationsOpen])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const initial = authUser?.name?.trim()?.charAt(0) ?? 'U'

  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-line bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 lg:px-10">
        <HeaderBrandLockup onOfficeFlowClick={() => navigate('/')} />

        <div className="flex items-center gap-2 sm:gap-3">
          {authUser ? (
            <>
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  aria-label="알림"
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className="relative grid h-10 w-10 place-items-center rounded-full text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Bell size={19} />
                  {unreadCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : null}
                </button>
                {notificationsOpen ? (
                  <NotificationCenter
                    onClose={() => setNotificationsOpen(false)}
                    onNavigate={navigate}
                  />
                ) : null}
              </div>

              <span className="hidden h-6 w-px bg-line sm:block" />

              <div className="flex items-center gap-2.5 pl-0.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-light text-sm font-bold text-brand">
                  {initial}
                </div>
                <div className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-semibold text-slate-800">{authUser.name}</span>
                  <span className="block text-xs text-slate-400">{authUser.position ?? '임직원'}</span>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/admin')}
                className="hidden sm:inline-flex"
              >
                <Settings size={14} />
                관리자
              </Button>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                aria-label="관리자"
                className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition-all duration-200 hover:bg-slate-100 sm:hidden"
              >
                <Settings size={18} />
              </button>

              <Button variant="secondary" size="sm" onClick={handleLogout} className="hidden sm:inline-flex">
                <LogOut size={15} />
                로그아웃
              </Button>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="로그아웃"
                className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition-all duration-200 hover:bg-slate-100 sm:hidden"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : authUser === null ? (
            <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
              <LogIn size={15} />
              로그인
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
