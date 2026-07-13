import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { MeetingActionItem, MeetingAnalysisResult } from '../types/meeting'

export const MEETING_ANALYSIS_SERVER_ERROR_MESSAGE =
  'AI 분석 서버에서 오류가 발생했습니다. Supabase Edge Function 로그를 확인해주세요.'

export type AnalyzeMeetingMinutesInput = {
  rawText: string
  currentDate?: string
}

async function readFunctionErrorBody(error: FunctionsHttpError): Promise<unknown> {
  try {
    return await error.context.json()
  } catch {
    try {
      return await error.context.text()
    } catch {
      return null
    }
  }
}

function logFunctionErrorBody(label: string, body: unknown) {
  console.error(`[meetingService] ${label}`, body)
}

async function logFunctionsHttpError(error: FunctionsHttpError): Promise<void> {
  const responseBody = await readFunctionErrorBody(error)
  console.error('[meetingService] analyze-meeting FunctionsHttpError:', {
    name: error.name,
    message: error.message,
    status: error.context.status,
    responseBody,
  })
}

async function resolveInvokeErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    await logFunctionsHttpError(error)
    return MEETING_ANALYSIS_SERVER_ERROR_MESSAGE
  }

  if (error instanceof FunctionsRelayError || error instanceof FunctionsFetchError) {
    console.error('[meetingService] analyze-meeting relay/fetch error:', {
      name: error.name,
      message: error.message,
      hint:
        'Edge Function이 배포되지 않았거나 CORS/네트워크 문제일 수 있습니다. `supabase functions deploy analyze-meeting` 실행을 확인해주세요.',
    })
    return MEETING_ANALYSIS_SERVER_ERROR_MESSAGE
  }

  if (error instanceof Error) {
    console.error('[meetingService] analyze-meeting unknown error:', error)
    return error.message
  }

  console.error('[meetingService] analyze-meeting unexpected error:', error)
  return MEETING_ANALYSIS_SERVER_ERROR_MESSAGE
}

export async function analyzeMeetingMinutes(
  input: AnalyzeMeetingMinutesInput,
): Promise<MeetingAnalysisResult> {
  const functionName = 'analyze-meeting'
  const requestBody = {
    raw_text: input.rawText,
    current_date: input.currentDate ?? new Date().toISOString().slice(0, 10),
  }

  console.info('[meetingService] invoking edge function:', functionName, {
    textLength: input.rawText.length,
    currentDate: requestBody.current_date,
  })

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: requestBody,
  })

  if (error) {
    throw new Error(await resolveInvokeErrorMessage(error))
  }

  if (!data || typeof data !== 'object') {
    console.error('[meetingService] analyze-meeting empty response:', { data })
    throw new Error(MEETING_ANALYSIS_SERVER_ERROR_MESSAGE)
  }

  if ('error' in data) {
    const payload = data as { error?: string; detail?: unknown }
    logFunctionErrorBody('analyze-meeting error payload', payload)
    throw new Error(MEETING_ANALYSIS_SERVER_ERROR_MESSAGE)
  }

  return data as MeetingAnalysisResult
}

function deriveMeetingTitle(rawText: string): string {
  const firstLine = rawText
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstLine) return '회의록'
  return firstLine.length > 60 ? `${firstLine.slice(0, 60)}...` : firstLine
}

export async function saveMeetingAnalysis(input: {
  rawText: string
  analysis: MeetingAnalysisResult
  title?: string
}): Promise<{ meetingId: string; actionItemCount: number }> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('로그인이 필요합니다.')
  }

  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({
      title: input.title?.trim() || deriveMeetingTitle(input.rawText),
      raw_text: input.rawText,
      summary: input.analysis.summary,
      decisions: input.analysis.decisions,
      risks: input.analysis.risks,
      follow_up_questions: input.analysis.follow_up_questions,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (meetingError || !meeting) {
    throw meetingError ?? new Error('회의록 저장에 실패했습니다.')
  }

  const actionItems = input.analysis.action_items
  if (actionItems.length > 0) {
    const { error: itemsError } = await supabase.from('meeting_action_items').insert(
      actionItems.map((item: MeetingActionItem) => ({
        meeting_id: meeting.id,
        task_title: item.task_title,
        description: item.description,
        owner_name: item.owner_name,
        due_label: item.due_label,
        due_date: item.due_date,
        priority: item.priority,
        status: item.status,
        evidence_text: item.evidence_text,
        confidence: item.confidence,
      })),
    )

    if (itemsError) {
      throw itemsError
    }
  }

  return {
    meetingId: meeting.id as string,
    actionItemCount: actionItems.length,
  }
}

export async function getPendingMeetingActionCount(userId: string): Promise<number> {
  const { data: meetings, error: meetingsError } = await supabase
    .from('meetings')
    .select('id')
    .eq('created_by', userId)

  if (meetingsError) throw meetingsError
  if (!meetings?.length) return 0

  const meetingIds = meetings.map((row) => row.id as string)
  const { count, error } = await supabase
    .from('meeting_action_items')
    .select('id', { count: 'exact', head: true })
    .in('meeting_id', meetingIds)
    .in('status', ['todo', 'in_progress', 'blocked'])

  if (error) throw error
  return count ?? 0
}
