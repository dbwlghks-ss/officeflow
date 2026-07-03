import { useEffect, useState } from 'react'
import { getNotices, type Notice } from '../services/noticeService'

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

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#002c5f]">
            <span className="text-sm font-bold text-white">OF</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#002c5f]">OfficeFlow</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#002c5f]">공지사항</h1>

        {loading ? (
          <p className="text-sm text-slate-500">불러오는 중...</p>
        ) : error ? (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : selected ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mb-6 text-sm font-medium text-[#002c5f] transition-colors hover:underline"
            >
              &larr; 목록으로
            </button>
            <div className="mb-2 flex items-center gap-2">
              {selected.is_pinned && (
                <span className="rounded bg-[#002c5f]/10 px-2 py-0.5 text-xs font-semibold text-[#002c5f]">
                  고정
                </span>
              )}
              <h2 className="text-xl font-semibold text-slate-800">{selected.title}</h2>
            </div>
            <p className="mb-6 text-sm text-slate-400">{formatDate(selected.created_at)}</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {selected.content}
            </p>
          </div>
        ) : notices.length === 0 ? (
          <p className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            등록된 공지사항이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {notices.map((notice) => (
              <li key={notice.id}>
                <button
                  type="button"
                  onClick={() => setSelected(notice)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    {notice.is_pinned && (
                      <span className="rounded bg-[#002c5f]/10 px-2 py-0.5 text-xs font-semibold text-[#002c5f]">
                        고정
                      </span>
                    )}
                    <span className="text-sm font-medium text-slate-800">{notice.title}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatDate(notice.created_at)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
