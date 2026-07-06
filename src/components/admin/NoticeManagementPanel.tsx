import { useCallback, useEffect, useState } from 'react'
import { Megaphone, Pencil, Pin, Plus, Trash2 } from 'lucide-react'
import {
  createNotice,
  deleteNotice,
  getAllNotices,
  setNoticePinned,
  setNoticePublished,
  updateNotice,
  type AdminNotice,
} from '../../services/noticeService'
import { Badge, Button, Card, inputClass } from '../ui/primitives'

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
    <Card className="max-w-4xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-6 py-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">공지 관리</h2>
          <p className="mt-0.5 text-sm text-slate-500">사내 공지를 등록하고 관리합니다.</p>
        </div>
        {!editing && (
          <Button type="button" size="sm" onClick={openNew}>
            <Plus size={16} />
            새 공지
          </Button>
        )}
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
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
              className={inputClass}
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
              className={inputClass + ' resize-y'}
              placeholder="공지 내용"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeForm} disabled={saving}>
              취소
            </Button>
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-3 p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-btn bg-slate-100/70" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <Megaphone size={22} />
          </div>
          <p className="text-sm font-medium text-slate-600">등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {notices.map((notice) => (
            <li key={notice.id} className="px-6 py-4 transition-colors hover:bg-slate-50/40">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                {notice.is_pinned && (
                  <Badge tone="brand">
                    <Pin size={11} />
                    고정
                  </Badge>
                )}
                {notice.is_published ? (
                  <Badge tone="success">게시중</Badge>
                ) : (
                  <Badge tone="neutral">미게시</Badge>
                )}
                <span className="truncate text-sm font-semibold text-slate-800">{notice.title}</span>
              </div>
              <p className="text-xs text-slate-400">{formatDate(notice.created_at)}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => openEdit(notice)} disabled={busyId === notice.id}>
                  <Pencil size={13} />
                  수정
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleTogglePinned(notice)} disabled={busyId === notice.id}>
                  {notice.is_pinned ? '고정 해제' : '상단 고정'}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleTogglePublished(notice)} disabled={busyId === notice.id}>
                  {notice.is_published ? '게시 중지' : '게시'}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(notice.id)} disabled={busyId === notice.id} className="text-danger hover:bg-red-50">
                  <Trash2 size={13} />
                  삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
