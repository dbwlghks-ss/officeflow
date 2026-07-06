-- 이미 제출한 설문 응답을 수정하는 RPC.
-- survey_responses(response_id)는 그대로 유지하고, 해당 응답에 속한 survey_answers 를
-- 모두 삭제한 뒤 새 답변으로 다시 저장한다. plpgsql 함수 본문은 단일 트랜잭션이므로
-- 삭제/재삽입 중 하나라도 실패하면 전체가 롤백되어 기존 답변이 사라지지 않는다.
--
-- 프론트엔드(surveyService.ts)에서 supabase.rpc('update_survey_response', ...) 로 호출한다.
-- 함수가 DB 에 없으면 PostgREST 가 404 를 반환하므로 반드시 Supabase SQL Editor 에서 실행해 등록해야 한다.
--
-- SECURITY INVOKER(기본값)로 동작하므로 기존 RLS 정책과 auth.uid() 가 그대로 적용된다.
-- 스키마: survey_responses(id, survey_id, user_id, created_at),
--         survey_answers(id, response_id, question_id, option_id, answer_text)

create or replace function public.update_survey_response(
  p_survey_id bigint,
  p_answers jsonb
)
returns bigint
language plpgsql
as $$
declare
  v_user uuid := auth.uid();
  v_response_id bigint;
  v_answer jsonb;
begin
  if v_user is null then
    raise exception '로그인이 필요합니다.';
  end if;

  -- 본인이 제출한 응답만 수정 가능
  select id
    into v_response_id
  from public.survey_responses
  where survey_id = p_survey_id
    and user_id = v_user;

  if v_response_id is null then
    raise exception '수정할 응답이 없습니다.';
  end if;

  -- 기존 답변 삭제 (response_id 는 유지)
  delete from public.survey_answers
  where response_id = v_response_id;

  -- 새 답변 저장
  for v_answer in
    select value from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) as value
  loop
    insert into public.survey_answers (response_id, question_id, option_id, answer_text)
    values (
      v_response_id,
      (v_answer ->> 'question_id')::bigint,
      nullif(v_answer ->> 'option_id', '')::bigint,
      v_answer ->> 'answer_text'
    );
  end loop;

  return v_response_id;
end;
$$;

grant execute on function public.update_survey_response(bigint, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- (선택) 위 함수는 SECURITY INVOKER 이므로 survey_answers 에 대한 DELETE / INSERT,
-- 그리고 수정 화면 프리필을 위한 survey_answers SELECT 권한이 필요하다.
-- 응답 수정/불러오기 시 권한(permission) 오류가 나면 아래 정책을 함께 실행한다.
-- ---------------------------------------------------------------------------
-- alter table public.survey_answers enable row level security;
--
-- drop policy if exists "select own answers" on public.survey_answers;
-- create policy "select own answers" on public.survey_answers
--   for select to authenticated
--   using (
--     exists (
--       select 1 from public.survey_responses r
--       where r.id = survey_answers.response_id
--         and r.user_id = auth.uid()
--     )
--   );
--
-- drop policy if exists "delete own answers" on public.survey_answers;
-- create policy "delete own answers" on public.survey_answers
--   for delete to authenticated
--   using (
--     exists (
--       select 1 from public.survey_responses r
--       where r.id = survey_answers.response_id
--         and r.user_id = auth.uid()
--     )
--   );
