import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Salad, Trash2 } from 'lucide-react'
import { getTodayDateKST } from '../../lib/koreanDate'
import { resolveAdminDataError } from '../../lib/adminDataErrors'
import {
  createMealMenu,
  deleteMealMenu,
  formatMenuItemsText,
  listMealMenusForAdmin,
  parseMenuItemsText,
  toggleMealMenuPublished,
  updateMealMenu,
  type MealMenu,
} from '../../services/mealMenuService'
import { Badge, Button, Card, inputClass } from '../ui/primitives'

type EditingState = 'new' | MealMenu | null

const EMPTY_FORM = {
  menu_date: getTodayDateKST(),
  meal_type: 'lunch',
  itemsText: '',
  note: '',
  calories: '',
  cafeteria: 'A동',
  is_published: true,
}

function formatMenuDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export default function MealMenuManagementPanel() {
  const [menus, setMenus] = useState<MealMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<EditingState>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [tableMissing, setTableMissing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setTableMissing(false)
    try {
      setMenus(await listMealMenusForAdmin())
    } catch (err) {
      const message = resolveAdminDataError(err, 'meal_menus')
      setError(message)
      if (message.includes('migration')) setTableMissing(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function openNew() {
    setEditing('new')
    setForm({ ...EMPTY_FORM, menu_date: getTodayDateKST() })
    setError(null)
  }

  function openEdit(menu: MealMenu) {
    setEditing(menu)
    setForm({
      menu_date: menu.menu_date,
      meal_type: menu.meal_type,
      itemsText: formatMenuItemsText(menu.items),
      note: menu.note ?? '',
      calories: menu.calories ? String(menu.calories) : '',
      cafeteria: menu.cafeteria || 'A동',
      is_published: menu.is_published,
    })
    setError(null)
  }

  function closeForm() {
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave() {
    const items = parseMenuItemsText(form.itemsText)
    if (!form.menu_date) {
      setError('날짜를 선택하세요.')
      return
    }
    if (items.length === 0) {
      setError('메뉴 항목을 한 줄 이상 입력하세요.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        menu_date: form.menu_date,
        meal_type: form.meal_type,
        items,
        note: form.note,
        calories: form.calories ? Number(form.calories) : null,
        cafeteria: form.cafeteria,
        is_published: form.is_published,
      }

      if (editing === 'new') {
        await createMealMenu(payload)
      } else if (editing) {
        await updateMealMenu(editing.id, payload)
      }

      closeForm()
      await load()
    } catch (err) {
      setError(resolveAdminDataError(err, 'meal_menus'))
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublished(menu: MealMenu) {
    setBusyId(menu.id)
    setError(null)
    try {
      await toggleMealMenuPublished(menu.id, !menu.is_published)
      await load()
    } catch (err) {
      setError(resolveAdminDataError(err, 'meal_menus'))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(menu: MealMenu) {
    if (!window.confirm(`${formatMenuDate(menu.menu_date)} 식단을 삭제할까요?`)) return

    setBusyId(menu.id)
    setError(null)
    try {
      await deleteMealMenu(menu.id)
      await load()
    } catch (err) {
      setError(resolveAdminDataError(err, 'meal_menus'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card className="max-w-5xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <Salad size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">식단 관리</h2>
            <p className="mt-0.5 max-w-xl text-sm text-slate-500">
              Ask OfficeFlow의 오늘 식단 질문에 표시될 메뉴를 등록합니다.
            </p>
          </div>
        </div>
        {!editing && !tableMissing && (
          <Button type="button" size="sm" onClick={openNew}>
            <Plus size={16} />
            식단 추가
          </Button>
        )}
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {editing ? (
        <div className="space-y-4 px-6 py-6">
          <h3 className="text-sm font-semibold text-slate-900">
            {editing === 'new' ? '식단 추가' : '식단 수정'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">날짜 *</span>
              <input
                type="date"
                className={inputClass}
                value={form.menu_date}
                onChange={(e) => setForm((current) => ({ ...current, menu_date: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">식사 구분</span>
              <select
                className={inputClass}
                value={form.meal_type}
                onChange={(e) => setForm((current) => ({ ...current, meal_type: e.target.value }))}
              >
                <option value="lunch">점심 (lunch)</option>
                <option value="dinner">저녁 (dinner)</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-600">메뉴 항목 *</span>
              <textarea
                className={inputClass + ' min-h-[120px] resize-y'}
                value={form.itemsText}
                onChange={(e) => setForm((current) => ({ ...current, itemsText: e.target.value }))}
                placeholder={'백미밥\n된장찌개\n제육볶음\n배추김치'}
              />
              <p className="mt-1 text-xs text-slate-400">줄바꿈 또는 쉼표로 항목을 구분합니다.</p>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-600">비고</span>
              <input
                className={inputClass}
                value={form.note}
                onChange={(e) => setForm((current) => ({ ...current, note: e.target.value }))}
                placeholder="A동 구내식당 기준"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">칼로리 (kcal)</span>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.calories}
                onChange={(e) => setForm((current) => ({ ...current, calories: e.target.value }))}
                placeholder="850"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">식당</span>
              <input
                className={inputClass}
                value={form.cafeteria}
                onChange={(e) => setForm((current) => ({ ...current, cafeteria: e.target.value }))}
                placeholder="A동"
              />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) =>
                  setForm((current) => ({ ...current, is_published: e.target.checked }))
                }
                className="h-4 w-4 rounded border-line text-brand focus:ring-brand/20"
              />
              <span className="text-sm text-slate-600">Assistant에 게시</span>
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeForm}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-btn bg-canvas" />
              ))}
            </div>
          ) : menus.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">
                {tableMissing ? '식단 테이블이 아직 연결되지 않았습니다.' : '등록된 식단이 없습니다.'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {tableMissing
                  ? 'Supabase migration 적용 후 오늘 식단을 추가할 수 있습니다.'
                  : '식단 추가 버튼으로 오늘 점심 메뉴를 등록하세요.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line/70">
              {menus.map((menu) => (
                <div key={menu.id} className="flex flex-wrap items-start justify-between gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{formatMenuDate(menu.menu_date)}</p>
                      <Badge tone="neutral">{menu.meal_type}</Badge>
                      <Badge tone={menu.is_published ? 'success' : 'warning'}>
                        {menu.is_published ? '게시됨' : '비게시'}
                      </Badge>
                      {menu.cafeteria ? (
                        <span className="text-xs text-slate-500">{menu.cafeteria}</span>
                      ) : null}
                    </div>
                    <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                      {menu.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    {menu.note ? (
                      <p className="mt-2 text-xs text-slate-500">비고: {menu.note}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={busyId === menu.id}
                      onClick={() => void handleTogglePublished(menu)}
                    >
                      {menu.is_published ? '비게시' : '게시'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busyId === menu.id}
                      onClick={() => openEdit(menu)}
                      aria-label="수정"
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busyId === menu.id}
                      onClick={() => void handleDelete(menu)}
                      aria-label="삭제"
                      className="text-danger hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  )
}
