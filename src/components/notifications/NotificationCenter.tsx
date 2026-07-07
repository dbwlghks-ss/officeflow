import { useCallback, useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import {
  fetchNotificationCenterData,
  type NotificationCenterItem,
} from '../../services/notificationDataService'
import { NOTICE_READ_EVENT } from '../../services/noticeReadService'
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
  const [items, setItems] = useState<NotificationCenterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError(false)

    try {
      const data = await fetchNotificationCenterData()
      setItems(data.items)
      onItemsChange?.(data.badgeCount)

      if (data.state === 'error') {
        setError(true)
      }
    } catch (loadError) {
      console.error('[notification-center] load failed:', loadError)
      setItems([])
      setError(true)
      onItemsChange?.(0)
    } finally {
      setLoading(false)
    }
  }, [onItemsChange])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications, refreshToken])

  useEffect(() => {
    function handleNoticeRead() {
      setRefreshToken((token) => token + 1)
    }

    window.addEventListener(NOTICE_READ_EVENT, handleNoticeRead)
    return () => window.removeEventListener(NOTICE_READ_EVENT, handleNoticeRead)
  }, [])

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
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-slate-500">알림을 불러오고 있습니다...</p>
          <div className="mt-3 space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-btn bg-slate-100/80" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">알림을 불러오지 못했습니다.</p>
          <p className="mt-1 text-xs text-slate-400">잠시 후 다시 시도해주세요.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-canvas text-slate-400">
            <Bell size={18} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-slate-700">알림이 없습니다.</p>
          <p className="mt-1 text-xs text-slate-400">새로운 업무 알림이 생기면 이곳에 표시됩니다.</p>
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
