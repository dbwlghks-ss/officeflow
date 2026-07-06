import { supabase } from '../lib/supabase'

export type SurveyStatus = 'draft' | 'open' | 'closed'

export type Survey = {
  id: number
  title: string
  description: string | null
  status: SurveyStatus
  created_at: string
}

export async function getSurveys(): Promise<Survey[]> {
  const { data, error } = await supabase
    .from('surveys')
    .select('id, title, description, status, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getOpenSurveys(): Promise<Survey[]> {
  const { data, error } = await supabase
    .from('surveys')
    .select('id, title, description, status, created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export type NewSurveyQuestion = {
  questionText: string
  questionType: Extract<QuestionType, 'single' | 'text'>
  isRequired: boolean
  options: string[]
}

// surveys / survey_questions / survey_options 를 단일 트랜잭션으로 저장한다.
// 실제 저장은 Supabase RPC(create_survey_with_questions) 안에서 이루어지며,
// plpgsql 함수 본문은 하나의 트랜잭션이므로 중간에 하나라도 실패하면 전체가 롤백된다.
export async function createSurveyWithQuestions(input: {
  title: string
  description: string
  status: Extract<SurveyStatus, 'draft' | 'open'>
  questions: NewSurveyQuestion[]
}): Promise<void> {
  const { error } = await supabase.rpc('create_survey_with_questions', {
    p_title: input.title,
    p_description: input.description,
    p_status: input.status,
    p_questions: input.questions.map((question) => ({
      question_text: question.questionText,
      question_type: question.questionType,
      is_required: question.isRequired,
      options: question.options,
    })),
  })

  if (error) throw error
}

export async function publishSurvey(id: number): Promise<void> {
  const { error } = await supabase
    .from('surveys')
    .update({ status: 'open' })
    .eq('id', id)

  if (error) throw error
}

export async function deleteSurvey(id: number): Promise<void> {
  const { error } = await supabase.from('surveys').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------
// 설문 문항 / 보기
// ---------------------------------------------------------

export type QuestionType = 'single' | 'text' | 'rating'

export type SurveyOption = {
  id: number
  option_text: string
  position: number
}

export type SurveyQuestion = {
  id: number
  question_text: string
  question_type: QuestionType
  is_required: boolean
  position: number
  survey_options: SurveyOption[]
}

export async function getQuestions(surveyId: number): Promise<SurveyQuestion[]> {
  const { data, error } = await supabase
    .from('survey_questions')
    .select(
      'id, question_text, question_type, is_required, position, survey_options(id, option_text, position)',
    )
    .eq('survey_id', surveyId)
    .order('position', { ascending: true })

  if (error) throw error

  return (data ?? []).map((q) => ({
    ...q,
    survey_options: [...(q.survey_options ?? [])].sort((a, b) => a.position - b.position),
  })) as SurveyQuestion[]
}

// ---------------------------------------------------------
// 설문 응답 (직원용)
// ---------------------------------------------------------

export type SubmitAnswer = {
  questionId: number
  optionId?: number | null
  answerText?: string | null
}

export async function hasResponded(surveyId: number, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('id')
    .eq('survey_id', surveyId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

// ---------------------------------------------------------
// 설문 결과 집계 (관리자용)
// ---------------------------------------------------------

export type SingleOptionResult = {
  optionId: number
  optionText: string
  count: number
  percent: number
}

export type RatingScoreCount = {
  score: number
  count: number
}

export type QuestionResult = {
  question: SurveyQuestion
  single?: { options: SingleOptionResult[]; total: number }
  rating?: { average: number; total: number; counts: RatingScoreCount[] }
  text?: string[]
}

export async function getSurveyResults(surveyId: number): Promise<QuestionResult[]> {
  const questions = await getQuestions(surveyId)
  if (questions.length === 0) return []

  const questionIds = questions.map((q) => q.id)
  const { data, error } = await supabase
    .from('survey_answers')
    .select('question_id, option_id, answer_text')
    .in('question_id', questionIds)

  if (error) throw error
  const answers = data ?? []

  return questions.map((question) => {
    const questionAnswers = answers.filter((a) => a.question_id === question.id)

    if (question.question_type === 'single') {
      const total = questionAnswers.filter((a) => a.option_id != null).length
      const options = question.survey_options.map((option) => {
        const count = questionAnswers.filter((a) => a.option_id === option.id).length
        return {
          optionId: option.id,
          optionText: option.option_text,
          count,
          percent: total > 0 ? Math.round((count / total) * 100) : 0,
        }
      })
      return { question, single: { options, total } }
    }

    if (question.question_type === 'rating') {
      const scores = questionAnswers
        .map((a) => Number(a.answer_text))
        .filter((n) => !Number.isNaN(n))
      const total = scores.length
      const average = total > 0 ? scores.reduce((sum, n) => sum + n, 0) / total : 0
      const counts = [1, 2, 3, 4, 5].map((score) => ({
        score,
        count: scores.filter((s) => s === score).length,
      }))
      return { question, rating: { average, total, counts } }
    }

    const texts = questionAnswers
      .map((a) => a.answer_text)
      .filter((t): t is string => Boolean(t && t.trim()))
    return { question, text: texts }
  })
}

export async function submitSurveyResponse(input: {
  surveyId: number
  answers: SubmitAnswer[]
}): Promise<void> {
  const { error } = await supabase.rpc('submit_survey_response', {
    p_survey_id: input.surveyId,
    p_answers: input.answers.map((answer) => ({
      question_id: answer.questionId,
      option_id: answer.optionId ?? null,
      answer_text: answer.answerText ?? null,
    })),
  })

  if (error) throw error
}

export type ExistingAnswer = {
  questionId: number
  optionId: number | null
  answerText: string | null
}

// 현재 로그인 사용자가 해당 설문에 제출했던 답변을 불러온다. (수정 화면 프리필용)
export async function getMyResponseAnswers(
  surveyId: number,
  userId: string,
): Promise<ExistingAnswer[] | null> {
  const { data: response, error } = await supabase
    .from('survey_responses')
    .select('id')
    .eq('survey_id', surveyId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!response) return null

  const { data, error: answersError } = await supabase
    .from('survey_answers')
    .select('question_id, option_id, answer_text')
    .eq('response_id', response.id)

  if (answersError) throw answersError

  return (data ?? []).map((answer) => ({
    questionId: answer.question_id,
    optionId: answer.option_id,
    answerText: answer.answer_text,
  }))
}

// 기존 응답을 수정한다. survey_responses(response_id)는 유지하고
// 해당 응답의 survey_answers 를 모두 삭제한 뒤 새 답변으로 다시 저장한다.
// 삭제 + 재삽입은 RPC 안에서 하나의 트랜잭션으로 처리된다.
export async function updateSurveyResponse(input: {
  surveyId: number
  answers: SubmitAnswer[]
}): Promise<void> {
  const { error } = await supabase.rpc('update_survey_response', {
    p_survey_id: input.surveyId,
    p_answers: input.answers.map((answer) => ({
      question_id: answer.questionId,
      option_id: answer.optionId ?? null,
      answer_text: answer.answerText ?? null,
    })),
  })

  if (error) throw error
}
