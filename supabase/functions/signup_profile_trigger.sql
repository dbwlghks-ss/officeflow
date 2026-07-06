-- 회원가입 기능 지원용 스키마 변경 + 트리거.
--
-- 1) profiles 테이블에 직급("position") / 부서(department) 텍스트 컬럼을 추가한다.
--    (기존 full_name, department_id, role, is_active 컬럼은 그대로 둔다.)
-- 2) auth.users 에 새 사용자가 생성되면(회원가입) profiles 행을 자동 생성하는
--    트리거를 등록한다. signUp 의 options.data(raw_user_meta_data)에 담긴
--    이름/직급/부서를 읽어 저장하고 role 은 'employee' 로 고정한다.
--
-- Supabase SQL Editor 에서 아래 전체를 실행한다.

-- 1) 컬럼 추가 --------------------------------------------------------------
alter table public.profiles add column if not exists "position" text;
alter table public.profiles add column if not exists department text;

-- 2) 신규 사용자 -> profiles 자동 생성 트리거 -------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, "position", department, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'position',
    new.raw_user_meta_data ->> 'department',
    'employee',
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
