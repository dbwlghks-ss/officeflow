import { supabase } from '../lib/supabase'
import type { MeetingActionItem, MeetingAnalysisResult } from '../types/meeting'

export type AnalyzeMeetingMinutesInput = {
  rawText: string
  currentDate?: string
}

export async function analyzeMeetingMinutes(
  input: AnalyzeMeetingMinutesInput,
): Promise<MeetingAnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-meeting', {
    body: {
      raw_text: input.rawText,
      current_date: input.currentDate ?? new Date().toISOString().slice(0, 10),
    },
  })

  if (error) {
    throw new Error(error.message || 'Meeting analysis failed.')
  }

  if (!data || typeof data !== 'object' || 'error' in data) {
    const message =
      data && typeof data === 'object' && 'error' in data
        ? String((data as { error?: string }).error)
        : 'Meeting analysis failed.'
    throw new Error(message)
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
