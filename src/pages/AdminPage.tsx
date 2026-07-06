import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Megaphone,
  UtensilsCrossed,
  Users,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { OfficeFlowLogo } from '../components/ui/Logo'
import { Badge } from '../components/ui/primitives'
import DashboardPanel from '../components/admin/DashboardPanel'
import MealManagementPanel from '../components/admin/MealManagementPanel'
import NoticeManagementPanel from '../components/admin/NoticeManagementPanel'
import StatisticsPanel from '../components/admin/StatisticsPanel'
import SurveyManagementPanel from '../components/admin/SurveyManagementPanel'
import UserManagementPanel from '../components/admin/UserManagementPanel'

type MenuKey = 'dashboard' | 'meal' | 'notice' | 'survey' | 'user' | 'stats'

type MenuItem = { key: MenuKey; label: string; icon: LucideIcon }

const MENU_SECTIONS: Array<{ title: string; items: MenuItem[] }> = [
  {
    title: '개요',
    items: [{ key: 'dashboard', label: '대시보드', icon: LayoutDashboard }],
  },
  {
    title: '운영 관리',
    items: [
      { key: 'meal', label: '식수 관리', icon: UtensilsCrossed },
      { key: 'notice', label: '공지 관리', icon: Megaphone },
      { key: 'survey', label: '설문 관리', icon: ClipboardList },
    ],
  },
  {
    title: '조직 · 분석',
    items: [
      { key: 'user', label: '사용자 관리', icon: Users },
      { key: 'stats', label: '통계', icon: BarChart3 },
    ],
  },
]

const MENU_LABELS: Record<MenuKey, string> = {
  dashboard: '대시보드',
  meal: '식수 관리',
  notice: '공지 관리',
  survey: '설문 관리',
  user: '사용자 관리',
  stats: '통계',
}

const MENU_DESCRIPTIONS: Record<MenuKey, string> = {
  dashboard: '오늘의 핵심 지표를 한눈에 확인합니다',
  meal: '일자별 식수 신청 현황을 관리합니다',
  notice: '사내 공지를 작성하고 게시합니다',
  survey: '설문을 만들고 응답 결과를 확인합니다',
  user: '임직원 계정과 권한을 관리합니다',
  stats: '전사 지표와 추이를 분석합니다',
}

function renderPanel(menu: MenuKey) {
  switch (menu) {
    case 'dashboard':
      return <DashboardPanel />
    case 'meal':
      return <MealManagementPanel />
    case 'notice':
      return <NoticeManagementPanel />
    case 'survey':
      return <SurveyManagementPanel />
    case 'user':
      return <UserManagementPanel />
    case 'stats':
      return <StatisticsPanel />
  }
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState<MenuKey>('meal')

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-canvas text-slate-800">
      <aside className="sticky top-0 flex h-screen w-[280px] shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex h-[72px] items-center border-b border-line px-6">
          <OfficeFlowLogo size="header" />
        </div>

        <nav className="scrollbar-slim flex-1 overflow-y-auto px-4 py-6">
          {MENU_SECTIONS.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const isActive = item.key === activeMenu
                  const Icon = item.icon
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveMenu(item.key)}
                      aria-current={isActive ? 'page' : undefined}
                      className={
                        'group relative flex items-center gap-3 rounded-btn px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 ' +
                        (isActive
                          ? 'bg-brand-light text-brand'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                      }
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
                      )}
                      <Icon
                        size={18}
                        className={
                          isActive
                            ? 'text-brand'
                            : 'text-slate-400 transition-colors group-hover:text-slate-600'
                        }
                      />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Home size={18} className="text-slate-400" />
            사이트로 이동
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-danger"
          >
            <LogOut size={18} className="text-slate-400" />
            로그아웃
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-line bg-surface/80 px-10 backdrop-blur-xl">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{MENU_LABELS[activeMenu]}</h1>
            <p className="text-[13px] text-slate-400">{MENU_DESCRIPTIONS[activeMenu]}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-400 md:block">{today}</span>
            <Badge tone="brand">관리자 모드</Badge>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] flex-1 p-10">{renderPanel(activeMenu)}</main>
      </div>
    </div>
  )
}
