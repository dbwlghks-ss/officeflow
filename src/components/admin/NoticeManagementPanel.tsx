import { useCallback, useEffect, useState } from 'react'
import {
  createNotice,
  deleteNotice,
  getAllNotices,
  setNoticePinned,
  setNoticePublished,
  updateNotice,
  type AdminNotice,
} from '../../services/noticeService'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function NoticeManagementPanel() {
  const [notices, setNotices] = useState<AdminNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const [editing, setEditing] = useState<'new' | AdminNotice | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setNotices(await getAllNotices())
    } catch {
      setError('공지 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openNew() {
    setEditing('new')
    setTitle('')
    setContent('')
    setError(null)
  }

  function openEdit(notice: AdminNotice) {
    setEditing(notice)
    setTitle(notice.title)
    setContent(notice.content)
    setError(null)
  }

  function closeForm() {
    setEditing(null)
    setTitle('')
    setContent('')
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력하세요.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editing === 'new') {
        await createNotice({ title: title.trim(), content: content.trim() })
      } else if (editing) {
        await updateNotice(editing.id, { title: title.trim(), content: content.trim() })
      }
      closeForm()
      await load()
    } catch {
      setError('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setBusyId(id)
    setError(null)
    try {
      await deleteNotice(id)
      await load()
    } catch {
      setError('삭제에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleTogglePinned(notice: AdminNotice) {
    setBusyId(notice.id)
    setError(null)
    try {
      await setNoticePinned(notice.id, !notice.is_pinned)
      await load()
    } catch {
      setError('상단 고정 변경에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleTogglePublished(notice: AdminNotice) {
    setBusyId(notice.id)
    setError(null)
    try {
      await setNoticePublished(notice.id, !notice.is_published)
      await load()
    } catch {
      setError('게시 여부 변경에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="max-w-3xl rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">공지 관리</h2>
          <p className="mt-0.5 text-sm text-slate-500">사내 공지를 등록하고 관리합니다.</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={openNew}
            className="rounded-md bg-[#002c5f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00234c]"
          >
            새 공지
          </button>
        )}
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {editing ? (
        <div className="px-6 py-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            {editing === 'new' ? '새 공지 작성' : '공지 수정'}
          </h3>
          <div className="mb-4">
            <label htmlFor="notice-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              제목
            </label>
            <input
              id="notice-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f] disabled:bg-slate-50"
              placeholder="공지 제목"
            />
          </div>
          <div className="mb-5">
            <label htmlFor="notice-content" className="mb-1.5 block text-sm font-medium text-slate-700">
              내용
            </label>
            <textarea
              id="notice-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={saving}
              rows={6}
              className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f] disabled:bg-slate-50"
              placeholder="공지 내용"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-[#002c5f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00234c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      ) : loading ? (
        <p className="px-6 py-6 text-sm text-slate-500">불러오는 중...</p>
      ) : notices.length === 0 ? (
        <p className="px-6 py-6 text-sm text-slate-600">등록된 공지사항이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {notices.map((notice) => (
            <li key={notice.id} className="px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {notice.is_pinned && (
                      <span className="rounded bg-[#002c5f]/10 px-2 py-0.5 text-xs font-semibold text-[#002c5f]">
                        고정
                      </span>
                    )}
                    <span
                      className={
                        notice.is_published
                          ? 'rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700'
                          : 'rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500'
                      }
                    >
                      {notice.is_published ? '게시중' : '미게시'}
                    </span>
                    <span className="truncate text-sm font-medium text-slate-800">
                      {notice.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{formatDate(notice.created_at)}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(notice)}
                  disabled={busyId === notice.id}
                  className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePinned(notice)}
                  disabled={busyId === notice.id}
                  className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {notice.is_pinned ? '고정 해제' : '상단 고정'}
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePublished(notice)}
                  disabled={busyId === notice.id}
                  className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {notice.is_published ? '게시 중지' : '게시'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(notice.id)}
                  disabled={busyId === notice.id}
                  className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
