import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import type { RecentUpdateItemData } from '../../lib/recentUpdatesMockData'
import { getLiveNotificationItems } from '../../services/notificationDataService'
import NotificationItem from './NotificationItem'

type NotificationCenterProps = {
  onNavigate: (path: string) => void
  onClose: () => void
  onItemsChange?: (unreadCount: number) => void
}

export default function NotificationCenter({
  onNavigate,
  onClose,
  onItemsChange,
}: NotificationCenterProps) {
  const [items, setItems] = useState<RecentUpdateItemData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      try {
        const nextItems = await getLiveNotificationItems()
        if (!active) return
        setItems(nextItems)
        onItemsChange?.(nextItems.filter((item) => item.isUnread !== false).length)
      } catch (error) {
        console.error('[notification-center] load failed:', error)
        if (!active) return
        setItems([])
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [onItemsChange])

  function handleAction(path: string) {
    onClose()
    onNavigate(path)
  }

  return (
    <div
      className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),380px)] overflow-hidden rounded-card border border-line bg-surface shadow-[0_16px_48px_-12px_rgba(15,23,42,0.18)]"
      role="dialog"
      aria-label="알림"
    >
      <div className="border-b border-line/70 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">알림</h2>
        <p className="mt-0.5 text-xs text-slate-500">최근 업무 업데이트를 확인하세요.</p>
      </div>

      {loading ? (
        <div className="space-y-0 px-4 py-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="mb-3 h-14 animate-pulse rounded-btn bg-slate-100/80" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-canvas text-slate-400">
            <Bell size={18} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-slate-700">새 알림이 없습니다</p>
          <p className="mt-1 text-xs text-slate-400">공지, 설문, 식수, 일정 업데이트가 여기에 표시됩니다.</p>
        </div>
      ) : (
        <ul className="m-0 max-h-[min(420px,60vh)] list-none overflow-y-auto p-0">
          {items.map((item) => (
            <NotificationItem key={item.id} item={item} onAction={handleAction} />
          ))}
        </ul>
      )}
    </div>
  )
}
