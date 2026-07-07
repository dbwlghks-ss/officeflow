import {
  ClipboardList,
  LayoutList,
  Megaphone,
  RefreshCw,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import type { AssistantIntent } from '../types/assistant'

export const INTENT_ICONS: Record<AssistantIntent, LucideIcon> = {
  summary: LayoutList,
  notices: Megaphone,
  surveys: ClipboardList,
  meal: UtensilsCrossed,
  updates: RefreshCw,
}

export function formatAssistantCheckedAt(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  if (diffMs < 60_000) return '방금 확인함'

  return (
    date.toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) + ' 확인'
  )
}

export const ASSISTANT_EMPTY_MESSAGE = '명령을 선택하면 업무 상태를 확인할 수 있습니다.'

export const ASSISTANT_LOADING_MESSAGE = '업무 데이터를 확인하고 있습니다...'

export const ASSISTANT_ERROR_MESSAGE = '데이터를 불러오지 못했습니다.'

export const ASSISTANT_ERROR_HINT =
  '잠시 후 다시 시도하거나 관련 페이지에서 직접 확인해주세요.'

export const ASSISTANT_UNAUTHENTICATED_MESSAGE = '로그인 후 업무 데이터를 확인할 수 있습니다.'
