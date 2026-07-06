-- 설문 + 문항 + 보기를 하나의 트랜잭션으로 생성하는 RPC.
-- plpgsql 함수 본문은 단일 트랜잭션에서 실행되므로 중간에 하나라도 실패하면
-- 전체가 자동으로 롤백되어 부분 저장이 남지 않는다.
--
-- Supabase SQL Editor 에서 아래 스크립트를 실행해 등록한다.
-- SECURITY INVOKER(기본값)로 동작하므로 기존 RLS 정책과 auth.uid() 가 그대로 적용된다.
--
-- 참고: surveys.status / survey_questions.question_type 이 text(+CHECK) 컬럼이라고 가정한다.
--       만약 enum 타입이라면 아래 INSERT 에서 값 뒤에 ::<enum_type> 캐스트를 추가한다.
--       (예: p_status::survey_status)

create or replace function public.create_survey_with_questions(
  p_title text,
  p_description text,
  p_status text,
  p_questions jsonb
)
returns bigint
language plpgsql
as $$
declare
  v_user uuid := auth.uid();
  v_survey_id bigint;
  v_question jsonb;
  v_question_id bigint;
  v_option jsonb;
  v_q_index int := 0;
  v_o_index int;
begin
  if v_user is null then
    raise exception '로그인이 필요합니다.';
  end if;

  insert into public.surveys (title, description, status, author_id)
  values (p_title, nullif(p_description, ''), p_status, v_user)
  returning id into v_survey_id;

  for v_question in
    select value from jsonb_array_elements(coalesce(p_questions, '[]'::jsonb)) as value
  loop
    insert into public.survey_questions (
      survey_id, question_text, question_type, is_required, position
    )
    values (
      v_survey_id,
      v_question ->> 'question_text',
      v_question ->> 'question_type',
      coalesce((v_question ->> 'is_required')::boolean, true),
      v_q_index
    )
    returning id into v_question_id;

    if (v_question ->> 'question_type') = 'single' then
      v_o_index := 0;
      for v_option in
        select value from jsonb_array_elements(coalesce(v_question -> 'options', '[]'::jsonb)) as value
      loop
        insert into public.survey_options (question_id, option_text, position)
        values (v_question_id, v_option #>> '{}', v_o_index);
        v_o_index := v_o_index + 1;
      end loop;
    end if;

    v_q_index := v_q_index + 1;
  end loop;

  return v_survey_id;
end;
$$;

grant execute on function public.create_survey_with_questions(text, text, text, jsonb) to authenticated;
