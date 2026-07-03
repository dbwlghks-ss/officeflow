import { useState } from 'react'
import DashboardPanel from '../components/admin/DashboardPanel'
import MealManagementPanel from '../components/admin/MealManagementPanel'
import NoticeManagementPanel from '../components/admin/NoticeManagementPanel'
import StatisticsPanel from '../components/admin/StatisticsPanel'
import SurveyManagementPanel from '../components/admin/SurveyManagementPanel'
import UserManagementPanel from '../components/admin/UserManagementPanel'

const MENU_ITEMS = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'meal', label: '식수 관리' },
  { key: 'notice', label: '공지 관리' },
  { key: 'survey', label: '설문 관리' },
  { key: 'user', label: '사용자 관리' },
  { key: 'stats', label: '통계' },
] as const

type MenuKey = (typeof MENU_ITEMS)[number]['key']

const MENU_LABELS: Record<MenuKey, string> = {
  dashboard: '대시보드',
  meal: '식수 관리',
  notice: '공지 관리',
  survey: '설문 관리',
  user: '사용자 관리',
  stats: '통계',
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
  const [activeMenu, setActiveMenu] = useState<MenuKey>('meal')

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="flex min-h-screen bg-[#f4f5f7] text-slate-800">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#002c5f]">
            <span className="text-sm font-bold text-white">OF</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#002c5f]">OfficeFlow</span>
        </div>

        <div className="px-6 pt-6 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">관리 메뉴</p>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 pb-6">
          {MENU_ITEMS.map((item) => {
            const isActive = item.key === activeMenu
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveMenu(item.key)}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'rounded-md bg-[#002c5f] px-3 py-2 text-left text-sm font-medium text-white'
                    : 'rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100'
                }
              >
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-[#002c5f]">{MENU_LABELS[activeMenu]}</h1>
              <p className="text-sm text-slate-500">{today}</p>
            </div>
            <span className="rounded-full bg-[#002c5f]/5 px-3 py-1 text-xs font-medium text-[#002c5f]">
              관리자
            </span>
          </div>
        </header>

        <main className="flex-1 p-8">{renderPanel(activeMenu)}</main>
      </div>
    </div>
  )
}
