import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type AnalyzeMeetingRequest = {
  raw_text?: string
  current_date?: string
}

type MeetingActionItem = {
  task_title: string
  description: string
  owner_name: string | null
  due_label: string | null
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'done' | 'blocked'
  evidence_text: string
  confidence: number
}

type MeetingAnalysisResponse = {
  summary: string
  decisions: string[]
  risks: string[]
  action_items: MeetingActionItem[]
  follow_up_questions: string[]
}

const SYSTEM_PROMPT = `You are an enterprise meeting-minutes analyst for OfficeFlow.
Extract structured meeting notes from Korean or mixed Korean/English meeting text.

Rules:
- Never invent facts that are not present in the input.
- If owner or due date is unclear, use null.
- If a due date phrase is ambiguous, keep the original phrase in due_label and set due_date to null.
- Every action item must include evidence_text copied or closely paraphrased from the source text.
- Put unclear areas into follow_up_questions.
- Return JSON only with this exact shape:
{
  "summary": string,
  "decisions": string[],
  "risks": string[],
  "action_items": [
    {
      "task_title": string,
      "description": string,
      "owner_name": string | null,
      "due_label": string | null,
      "due_date": string | null,
      "priority": "low" | "medium" | "high",
      "status": "todo" | "in_progress" | "done" | "blocked",
      "evidence_text": string,
      "confidence": number
    }
  ],
  "follow_up_questions": string[]
}`

const VALID_PRIORITIES = new Set(['low', 'medium', 'high'])
const VALID_STATUSES = new Set(['todo', 'in_progress', 'done', 'blocked'])

const SAFE_FALLBACK: MeetingAnalysisResponse = {
  summary: '회의록 내용을 구조화하지 못했습니다. 원문을 확인한 뒤 다시 분석해주세요.',
  decisions: [],
  risks: [],
  action_items: [],
  follow_up_questions: ['회의록 분석 결과가 올바르지 않습니다. 내용을 조금 더 명확히 입력해주세요.'],
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function normalizePriority(value: unknown): MeetingActionItem['priority'] {
  return typeof value === 'string' && VALID_PRIORITIES.has(value)
    ? (value as MeetingActionItem['priority'])
    : 'medium'
}

function normalizeStatus(value: unknown): MeetingActionItem['status'] {
  return typeof value === 'string' && VALID_STATUSES.has(value)
    ? (value as MeetingActionItem['status'])
    : 'todo'
}

function normalizeNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function normalizeActionItem(value: unknown): MeetingActionItem | null {
  if (!value || typeof value !== 'object') return null

  const item = value as Record<string, unknown>
  const taskTitle = typeof item.task_title === 'string' ? item.task_title.trim() : ''
  if (!taskTitle) return null

  const dueDate = normalizeNullableString(item.due_date)

  return {
    task_title: taskTitle,
    description: typeof item.description === 'string' ? item.description.trim() : '',
    owner_name: normalizeNullableString(item.owner_name),
    due_label: normalizeNullableString(item.due_label),
    due_date: dueDate && /^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? dueDate : null,
    priority: normalizePriority(item.priority),
    status: normalizeStatus(item.status),
    evidence_text: typeof item.evidence_text === 'string' ? item.evidence_text.trim() : '',
    confidence:
      typeof item.confidence === 'number' && !Number.isNaN(item.confidence)
        ? Math.min(1, Math.max(0, item.confidence))
        : 0.5,
  }
}

function validateAndNormalizeAnalysis(payload: unknown): MeetingAnalysisResponse {
  if (!payload || typeof payload !== 'object') {
    console.warn('[analyze-meeting] invalid payload type, using fallback')
    return SAFE_FALLBACK
  }

  const raw = payload as Record<string, unknown>

  if (typeof raw.summary !== 'string') {
    console.warn('[analyze-meeting] invalid summary type, using fallback')
    return SAFE_FALLBACK
  }

  const decisions = isStringArray(raw.decisions) ? raw.decisions.filter(Boolean) : []
  const risks = isStringArray(raw.risks) ? raw.risks.filter(Boolean) : []
  const followUpQuestions = isStringArray(raw.follow_up_questions)
    ? raw.follow_up_questions.filter(Boolean)
    : []

  const actionItems = Array.isArray(raw.action_items)
    ? raw.action_items
        .map((item) => normalizeActionItem(item))
        .filter((item): item is MeetingActionItem => item !== null)
    : []

  if (!isStringArray(raw.decisions) || !isStringArray(raw.risks) || !Array.isArray(raw.action_items)) {
    console.warn('[analyze-meeting] partial type mismatch, normalized safe fields')
  }

  return {
    summary: raw.summary.trim() || SAFE_FALLBACK.summary,
    decisions,
    risks,
    action_items: actionItems,
    follow_up_questions:
      followUpQuestions.length > 0
        ? followUpQuestions
        : !isStringArray(raw.follow_up_questions)
          ? SAFE_FALLBACK.follow_up_questions
          : [],
  }
}

function truncateText(value: string, maxLength = 500): string {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength)}...`
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return jsonResponse({ ok: true })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const openAiKey = Deno.env.get('OPENAI_API_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse(
        {
          error:
            'Supabase 환경 변수가 설정되지 않았습니다. SUPABASE_URL과 SUPABASE_ANON_KEY를 확인해주세요.',
        },
        500,
      )
    }

    if (!openAiKey) {
      console.error('[analyze-meeting] OPENAI_API_KEY is missing')
      return jsonResponse({ error: 'OPENAI_API_KEY가 설정되지 않았습니다' }, 500)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: '인증 토큰이 없습니다. 다시 로그인해주세요.' }, 401)
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return jsonResponse(
        { error: userError?.message ?? '인증에 실패했습니다. 다시 로그인해주세요.' },
        401,
      )
    }

    let body: AnalyzeMeetingRequest
    try {
      body = (await req.json()) as AnalyzeMeetingRequest
    } catch (parseError) {
      console.error('[analyze-meeting] invalid JSON body:', parseError)
      return jsonResponse({ error: '요청 본문이 올바른 JSON 형식이 아닙니다.' }, 400)
    }

    const rawText = body.raw_text?.trim() ?? ''
    const currentDate = body.current_date ?? new Date().toISOString().slice(0, 10)

    if (!rawText) {
      return jsonResponse({ error: 'raw_text is required.' }, 400)
    }

    console.log('[analyze-meeting] calling OpenAI API', {
      model: 'gpt-4o-mini',
      textLength: rawText.length,
      currentDate,
    })

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `current_date: ${currentDate}\n\nmeeting_text:\n${rawText}`,
          },
        ],
      }),
    })

    console.log('[analyze-meeting] OpenAI API response received', {
      status: openAiResponse.status,
      ok: openAiResponse.ok,
    })

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text()
      console.error('[analyze-meeting] OpenAI API error:', {
        status: openAiResponse.status,
        statusText: openAiResponse.statusText,
        body: errorText,
      })
      return jsonResponse(
        {
          error: 'OpenAI 회의록 분석 요청에 실패했습니다.',
          detail: {
            status: openAiResponse.status,
            message: openAiResponse.statusText,
            body: errorText,
          },
        },
        502,
      )
    }

    const completion = await openAiResponse.json()
    const content = completion?.choices?.[0]?.message?.content

    console.log('[analyze-meeting] OpenAI API parsed completion', {
      hasContent: Boolean(content),
      contentLength: typeof content === 'string' ? content.length : 0,
    })

    if (!content || typeof content !== 'string') {
      return jsonResponse(
        {
          error: 'AI 응답 형식이 올바르지 않습니다.',
          detail: truncateText(JSON.stringify(completion ?? {})),
        },
        502,
      )
    }

    let parsedContent: unknown
    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      console.error('[analyze-meeting] AI JSON parse error:', parseError, content)
      return jsonResponse(
        {
          error: 'AI 응답 JSON 파싱에 실패했습니다.',
          detail: truncateText(content),
        },
        502,
      )
    }

    const parsed = validateAndNormalizeAnalysis(parsedContent)
    console.log('[analyze-meeting] analysis normalized', {
      decisionCount: parsed.decisions.length,
      riskCount: parsed.risks.length,
      actionItemCount: parsed.action_items.length,
    })
    return jsonResponse(parsed)
  } catch (error) {
    const message = getErrorMessage(error)
    console.error('[analyze-meeting] unexpected error:', error)
    return jsonResponse(
      {
        error: '회의록 분석 중 서버 오류가 발생했습니다.',
        detail: message,
      },
      500,
    )
  }
})
