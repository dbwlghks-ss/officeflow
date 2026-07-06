-- 이메일 인증(auth.users.email_confirmed_at IS NOT NULL)을 완료한 사용자만
-- "실제 직원"으로 취급하기 위한 RPC 모음.
--
-- auth.users 는 클라이언트(PostgREST)에서 직접 조회할 수 없으므로,
-- profiles 와 auth.users 를 조인하는 SECURITY DEFINER 함수를 두어
-- 인증 완료 사용자만 반환/집계한다.
--
-- RLS 정책은 변경하지 않는다. 대신 각 함수는 호출자가 관리자인지 확인하여
-- 관리자에게만 데이터를 제공한다(관리자 화면 전용).
--
-- Supabase SQL Editor 에서 아래 전체를 실행한다.

-- 현재 로그인 사용자가 관리자인지 확인 -----------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- 인증 완료 사용자 목록 (관리자 전용) ------------------------------------
create or replace function public.get_confirmed_profiles()
returns table (
  id uuid,
  full_name text,
  email text,
  role text,
  is_active boolean,
  "position" text,
  department text,
  department_name text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    p.email,
    p.role::text,
    p.is_active,
    p."position",
    p.department,
    d.name as department_name
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.departments d on d.id = p.department_id
  where public.is_admin()
    and u.email_confirmed_at is not null
  order by p.full_name asc;
$$;

-- 인증 완료 전체 직원 수 (관리자 전용) ----------------------------------
create or replace function public.count_confirmed_profiles()
returns integer
language sql
security definer
set search_path = public
as $$
  select case
    when public.is_admin() then (
      select count(*)::int
      from public.profiles p
      join auth.users u on u.id = p.id
      where u.email_confirmed_at is not null
    )
    else 0
  end;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_confirmed_profiles() to authenticated;
grant execute on function public.count_confirmed_profiles() to authenticated;
