import type { AssistantIntent } from '../../types/assistant'
import type { DetectedRuleIntent, EmployeeLookupField } from './assistantTypes'

const NAME_STOPWORDS = new Set([
  '직급',
  '직책',
  'position',
  '부서',
  '팀',
  '소속',
  '전화번호',
  '연락처',
  '내선',
  '번호',
  '이메일',
  'email',
  '메일',
  '뭐야',
  '뭐',
  '알려줘',
  '알려',
  '조회',
  '찾아',
  '찾기',
  '찾아줘',
  '누구',
  '무슨',
  '어디',
  '직원',
  '사원',
  '정보',
  '오늘',
  '점심',
  '밥',
  '식수',
  '식단',
  '메뉴',
  '구내식당',
  '해줘',
  '해주세요',
  '부탁',
  '좀',
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '의',
  '에',
  '와',
  '과',
])

function normalize(input: string): string {
  return input.toLowerCase().replace(/\s+/g, ' ').trim()
}

function includesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

function detectEmployeeField(text: string): EmployeeLookupField {
  if (/(직급|직책|position)/.test(text)) return 'position'
  if (/(부서|팀|소속)/.test(text)) return 'department'
  if (/(전화번호|연락처|내선|번호)/.test(text)) return 'phone'
  if (/(이메일|email|메일)/.test(text)) return 'email'
  return 'summary'
}

function normalizeToken(token: string): string {
  return token
    .replace(/[?.!,]/g, '')
    .replace(/(이야|입니까|인가요|입니다|해줘|해주세요|알려줘)$/g, '')
}

export function extractEmployeeNameQuery(input: string): string {
  const tokens = input
    .trim()
    .split(/\s+/)
    .map(normalizeToken)
    .filter(Boolean)

  const remaining = tokens.filter((token) => !NAME_STOPWORDS.has(token.toLowerCase()))
  return remaining.join(' ').trim()
}

function looksLikeEmployeeLookup(text: string, nameQuery: string): boolean {
  const hasFieldKeyword = /(직급|직책|position|부서|팀|소속|전화번호|연락처|내선|번호|이메일|email|메일|직원|사원)/.test(
    text,
  )
  const hasLookupVerb = /(알려|찾|조회|뭐야|무슨)/.test(text)
  return hasFieldKeyword || (nameQuery.length >= 2 && hasLookupVerb)
}

function detectLegacyIntent(text: string): AssistantIntent | null {
  if (/(할\s*일|업무\s*요약|오늘\s*요약|업무\s*상태)/.test(text)) return 'summary'
  if (/(읽지\s*않|공지)/.test(text)) return 'notices'
  if (/설문/.test(text)) return 'surveys'
  if (/(식수\s*상태|식수\s*신청\s*상태|신청\s*상태)/.test(text)) return 'meal'
  if (/(업데이트|최근\s*변경)/.test(text)) return 'updates'
  return null
}

function isCancelMealIntent(text: string): boolean {
  return includesAny(text, [
    /(식수|밥|점심).*(안\s*먹|안먹|취소)/,
    /(안\s*먹|안먹).*(식수|밥|점심)/,
    /식수.*안/,
    /밥.*안\s*먹/,
    /안\s*먹는\s*걸로/,
    /안먹는\s*걸로/,
  ])
}

function isApplyMealIntent(text: string): boolean {
  return includesAny(text, [
    /(식수|밥).*(먹|신청)/,
    /먹는\s*걸로/,
    /먹을게/,
    /오늘.*식수.*(먹|신청)/,
    /식수\s*신청/,
  ])
}

function isTodayMealMenuIntent(text: string): boolean {
  return includesAny(text, [
    /(오늘|점심).*(밥|식단|메뉴|뭐\s*나|뭐야)/,
    /구내식당/,
    /오늘\s*뭐\s*나/,
    /점심\s*메뉴/,
    /메뉴\s*뭐/,
  ])
}

export function detectRuleBasedIntent(input: string): DetectedRuleIntent {
  const text = normalize(input)
  if (!text) return { type: 'UNKNOWN' }

  if (isCancelMealIntent(text)) {
    return { type: 'CANCEL_TODAY_MEAL' }
  }

  if (isApplyMealIntent(text)) {
    return { type: 'APPLY_TODAY_MEAL' }
  }

  if (isTodayMealMenuIntent(text)) {
    return { type: 'GET_TODAY_MEAL' }
  }

  const legacyIntent = detectLegacyIntent(text)
  if (legacyIntent) {
    return { type: 'LEGACY', intent: legacyIntent }
  }

  const nameQuery = extractEmployeeNameQuery(input)
  if (looksLikeEmployeeLookup(text, nameQuery)) {
    return {
      type: 'EMPLOYEE_LOOKUP',
      nameQuery,
      field: detectEmployeeField(text),
    }
  }

  return { type: 'UNKNOWN' }
}

export const UNKNOWN_INTENT_EXAMPLES = [
  '오늘 밥 뭐야?',
  '홍길동 전화번호 알려줘',
  '오늘 식수 먹는 걸로 해줘',
]

export const SUGGESTED_ASSISTANT_QUERIES = [
  '오늘 밥 뭐야?',
  '오늘 할 일 알려줘',
  '오늘 식수 먹는 걸로 해줘',
  '직원 연락처 찾기',
]
