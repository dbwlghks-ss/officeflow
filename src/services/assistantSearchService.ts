import { getMailHubData } from '../lib/mailHubMockData'
import {
  ASSISTANT_ERROR_HINT,
  ASSISTANT_ERROR_MESSAGE,
  ASSISTANT_LOADING_MESSAGE,
  ASSISTANT_UNAUTHENTICATED_MESSAGE,
} from '../lib/assistantUi'
import { SEARCH_SCOPE_LABELS } from '../lib/assistantSearches'
import type { AssistantResponse, AssistantSearchScope } from '../types/assistant'
import { getNotices } from './noticeService'
import { getSurveys } from './surveyService'
import { getProfiles } from './userService'

type SearchHit = {
  category: keyof typeof SEARCH_SCOPE_LABELS
  label: string
  detail?: string
  path?: string
}

function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase())
}

function categoryPrefix(category: SearchHit['category']): string {
  return `[${SEARCH_SCOPE_LABELS[category]}]`
}

async function searchNotices(query: string): Promise<SearchHit[]> {
  const notices = await getNotices()
  return notices
    .filter(
      (notice) => matchesQuery(notice.title, query) || matchesQuery(notice.content, query),
    )
    .map((notice) => ({
      category: 'notices' as const,
      label: notice.title,
      path: '/notice',
    }))
}

async function searchSurveys(query: string): Promise<SearchHit[]> {
  const surveys = await getSurveys()
  return surveys
    .filter(
      (survey) =>
        matchesQuery(survey.title, query) ||
        matchesQuery(survey.description ?? '', query),
    )
    .map((survey) => ({
      category: 'surveys' as const,
      label: survey.title,
      detail: survey.status === 'open' ? '진행 중' : undefined,
      path: '/survey',
    }))
}

function searchMail(query: string): SearchHit[] {
  const { previews } = getMailHubData()
  return previews
    .filter(
      (mail) =>
        matchesQuery(mail.subject, query) ||
        matchesQuery(mail.preview, query) ||
        matchesQuery(mail.from, query),
    )
    .map((mail) => ({
      category: 'mail' as const,
      label: mail.subject,
      detail: mail.from,
    }))
}

async function searchUsers(query: string): Promise<SearchHit[]> {
  try {
    const profiles = await getProfiles()
    return profiles
      .filter(
        (profile) =>
          matchesQuery(profile.full_name, query) ||
          matchesQuery(profile.email, query) ||
          matchesQuery(profile.department_name ?? '', query) ||
          matchesQuery(profile.position ?? '', query),
      )
      .map((profile) => ({
        category: 'users' as const,
        label: profile.full_name,
        detail: profile.position ?? profile.department_name ?? profile.email,
      }))
  } catch (error) {
    console.error('[assistant] user search failed:', error)
    return []
  }
}

async function collectHits(query: string, scope: AssistantSearchScope): Promise<SearchHit[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const buckets: SearchHit[] = []

  if (scope === 'all' || scope === 'notices') {
    buckets.push(...(await searchNotices(trimmed)))
  }
  if (scope === 'all' || scope === 'surveys') {
    buckets.push(...(await searchSurveys(trimmed)))
  }
  if (scope === 'all' || scope === 'mail') {
    buckets.push(...searchMail(trimmed))
  }
  if (scope === 'all' || scope === 'users') {
    buckets.push(...(await searchUsers(trimmed)))
  }

  return buckets.slice(0, 5)
}

function buildSearchResponse(
  query: string,
  scope: AssistantSearchScope,
  hits: SearchHit[],
): AssistantResponse {
  const scopeLabel = SEARCH_SCOPE_LABELS[scope]

  if (hits.length === 0) {
    return {
      title: `"${query}" 검색 결과`,
      message: `${scopeLabel} 범위에서 일치하는 결과가 없습니다.`,
      hint: '검색어를 바꾸거나 범위를 넓혀 다시 시도해주세요.',
      lines: [],
      state: 'ready',
    }
  }

  const actions = [
    hits.some((hit) => hit.category === 'notices')
      ? { label: '공지사항 보기', path: '/notice' }
      : null,
    hits.some((hit) => hit.category === 'surveys')
      ? { label: '설문조사 보기', path: '/survey' }
      : null,
  ].filter((action): action is { label: string; path: string } => Boolean(action))

  return {
    title: `"${query}" 검색 결과`,
    message: `${scopeLabel} 범위에서 ${hits.length}건을 찾았습니다.`,
    lines: hits.map((hit) => {
      const detail = hit.detail ? ` — ${hit.detail}` : ''
      return `${categoryPrefix(hit.category)} ${hit.label}${detail}`
    }),
    actions: actions.length > 0 ? actions.slice(0, 2) : undefined,
    state: 'ready',
  }
}

export function getLoadingSearchResponse(query: string): AssistantResponse {
  return {
    title: `"${query}" 검색 중`,
    message: ASSISTANT_LOADING_MESSAGE,
    lines: [],
    state: 'loading',
  }
}

export function getSearchFallbackResponse(query: string): AssistantResponse {
  return {
    title: `"${query}" 검색 결과`,
    message: ASSISTANT_ERROR_MESSAGE,
    hint: ASSISTANT_ERROR_HINT,
    lines: [],
    state: 'error',
  }
}

export function getSearchUnauthenticatedResponse(query: string): AssistantResponse {
  return {
    title: `"${query}" 검색 결과`,
    message: ASSISTANT_UNAUTHENTICATED_MESSAGE,
    lines: [],
    state: 'error',
  }
}

export async function executeAssistantSearch(
  query: string,
  scope: AssistantSearchScope,
): Promise<AssistantResponse> {
  const trimmed = query.trim()
  if (!trimmed) {
    return {
      title: '검색',
      message: '검색어를 입력해주세요.',
      lines: [],
      state: 'ready',
    }
  }

  try {
    const hits = await collectHits(trimmed, scope)
    return buildSearchResponse(trimmed, scope, hits)
  } catch (error) {
    console.error('[assistant] executeAssistantSearch failed:', error)
    return getSearchFallbackResponse(trimmed)
  }
}
