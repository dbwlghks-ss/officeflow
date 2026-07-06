-- 설문 응답(survey_responses) + 응답 항목(survey_answers)을 하나의 트랜잭션으로 저장하는 RPC.
-- plpgsql 함수 본문은 단일 트랜잭션에서 실행되므로 중간에 하나라도 실패하면
-- 전체가 자동으로 롤백되어 부분 저장이 남지 않는다.
--
-- 프론트엔드(surveyService.ts)에서 supabase.rpc('submit_survey_response', ...) 로 호출한다.
-- 함수가 DB 에 없으면 PostgREST 가 404 를 반환하므로 반드시 Supabase SQL Editor 에서 실행해 등록해야 한다.
--
-- SECURITY INVOKER(기본값)로 동작하므로 기존 RLS 정책과 auth.uid() 가 그대로 적용된다.
-- 스키마: survey_responses(id, survey_id, user_id, created_at),
--         survey_answers(id, response_id, question_id, option_id, answer_text)

create or replace function public.submit_survey_response(
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

  -- 중복 제출 방지 (한 사용자가 같은 설문에 한 번만 응답)
  if exists (
    select 1
    from public.survey_responses
    where survey_id = p_survey_id
      and user_id = v_user
  ) then
    raise exception '이미 응답한 설문입니다.';
  end if;

  -- 1) 응답 레코드 생성
  insert into public.survey_responses (survey_id, user_id)
  values (p_survey_id, v_user)
  returning id into v_response_id;

  -- 2) 응답 항목 저장
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

grant execute on function public.submit_survey_response(bigint, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- (선택) 위 함수는 SECURITY INVOKER 이므로 survey_responses / survey_answers 에
-- 본인 응답을 INSERT 할 수 있는 RLS 정책이 필요하다. 제출 시 권한(permission) 오류가
-- 나면 아래 정책을 함께 실행한다.
-- ---------------------------------------------------------------------------
-- alter table public.survey_responses enable row level security;
-- alter table public.survey_answers  enable row level security;
--
-- drop policy if exists "insert own response" on public.survey_responses;
-- create policy "insert own response" on public.survey_responses
--   for insert to authenticated
--   with check (user_id = auth.uid());
--
-- drop policy if exists "insert own answers" on public.survey_answers;
-- create policy "insert own answers" on public.survey_answers
--   for insert to authenticated
--   with check (
--     exists (
--       select 1 from public.survey_responses r
--       where r.id = survey_answers.response_id
--         and r.user_id = auth.uid()
--     )
--   );
