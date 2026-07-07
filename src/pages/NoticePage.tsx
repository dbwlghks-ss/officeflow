import { useEffect, useState } from 'react'
import { ArrowLeft, ChevronRight, Megaphone, Pin } from 'lucide-react'
import Header from '../components/layout/Header'
import { getNotices, type Notice } from '../services/noticeService'
import { markNoticeAsRead } from '../services/noticeReadService'
import { Badge, Card } from '../components/ui/primitives'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function NoticePage() {
  const [loading, setLoading] = useState(true)
  const [notices, setNotices] = useState<Notice[]>([])
  const [selected, setSelected] = useState<Notice | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getNotices()
      .then((data) => {
        if (active) setNotices(data)
      })
      .catch(() => {
        if (active) setError('공지사항을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selected) return

    void markNoticeAsRead(selected.id).catch((error) => {
      console.error('[notice] mark as read failed:', error)
    })
  }, [selected])

  return (
    <div className="min-h-screen bg-canvas text-slate-800">
      <Header />

      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <Megaphone size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">공지사항</h1>
            <p className="text-sm text-slate-400">사내 소식과 안내를 확인하세요.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-card bg-slate-100/70" />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-btn bg-red-50 px-4 py-3 text-sm text-danger">{error}</p>
        ) : selected ? (
          <Card className="p-8">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
            >
              <ArrowLeft size={16} />
              목록으로
            </button>
            <div className="mb-2 flex items-center gap-2">
              {selected.is_pinned && (
                <Badge tone="brand">
                  <Pin size={11} />
                  고정
                </Badge>
              )}
              <h2 className="text-2xl font-bold text-slate-900">{selected.title}</h2>
            </div>
            <p className="mb-6 text-sm text-slate-400">{formatDate(selected.created_at)}</p>
            <div className="h-px w-full bg-line" />
            <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
              {selected.content}
            </p>
          </Card>
        ) : notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-card border border-line bg-surface px-6 py-16 text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
              <Megaphone size={22} />
            </div>
            <p className="text-sm font-medium text-slate-600">등록된 공지사항이 없습니다.</p>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-line">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(notice)}
                    className="group flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50/60"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      {notice.is_pinned && (
                        <Badge tone="brand">
                          <Pin size={11} />
                          고정
                        </Badge>
                      )}
                      <span className="truncate text-sm font-medium text-slate-800">{notice.title}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-slate-400">{formatDate(notice.created_at)}</span>
                      <ChevronRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </main>
    </div>
  )
}
