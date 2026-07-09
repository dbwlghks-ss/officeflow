-- Sync employee_directory from profiles (auto-register on signup / profile updates)
-- Apply via Supabase SQL Editor or `supabase db push` — does NOT auto-run on production.
--
-- profiles fields used:
--   id, full_name, email, department, position, is_active
-- employee_directory.profile_id links to profiles.id (same as auth.users.id)

-- ---------------------------------------------------------------------------
-- 1. profile_id column + unique constraint
-- ---------------------------------------------------------------------------
alter table public.employee_directory
  add column if not exists profile_id uuid references public.profiles (id) on delete cascade;

comment on column public.employee_directory.profile_id is
  'Linked OfficeFlow profile; NULL means manually entered directory row.';

create unique index if not exists employee_directory_profile_id_uidx
  on public.employee_directory (profile_id);

-- ---------------------------------------------------------------------------
-- 2. Upsert helper (profile → directory)
-- ---------------------------------------------------------------------------
create or replace function public.upsert_employee_directory_for_profile(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_profile public.profiles%rowtype;
  v_name text;
  v_department text;
  v_position text;
  v_work_email text;
  v_is_active boolean;
  v_email_confirmed boolean;
begin
  select *
  into v_profile
  from public.profiles
  where id = p_profile_id;

  if not found then
    return;
  end if;

  v_name := nullif(trim(coalesce(v_profile.full_name, '')), '');
  if v_name is null then
    v_name := nullif(trim(coalesce(v_profile.email, '')), '');
  end if;

  if v_name is null then
    return;
  end if;

  v_department := nullif(trim(coalesce(v_profile.department, '')), '');
  v_position := nullif(trim(coalesce(v_profile."position", '')), '');
  v_work_email := nullif(trim(coalesce(v_profile.email, '')), '');

  select (u.email_confirmed_at is not null)
  into v_email_confirmed
  from auth.users u
  where u.id = p_profile_id;

  v_is_active := coalesce(v_profile.is_active, true) and coalesce(v_email_confirmed, false);

  insert into public.employee_directory (
    profile_id,
    name,
    department,
    position,
    work_email,
    is_active,
    updated_at
  )
  values (
    p_profile_id,
    v_name,
    v_department,
    v_position,
    v_work_email,
    v_is_active,
    now()
  )
  on conflict (profile_id) do update
  set
    name = excluded.name,
    department = coalesce(excluded.department, employee_directory.department),
    position = coalesce(excluded.position, employee_directory.position),
    work_email = coalesce(excluded.work_email, employee_directory.work_email),
    is_active = excluded.is_active,
    updated_at = now();
end;
$$;

comment on function public.upsert_employee_directory_for_profile(uuid) is
  'Creates or updates employee_directory from a profiles row. Preserves extension/work_phone on update.';

-- ---------------------------------------------------------------------------
-- 3. profiles trigger
-- ---------------------------------------------------------------------------
create or replace function public.sync_employee_directory_from_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  perform public.upsert_employee_directory_for_profile(new.id);
  return new;
end;
$$;

drop trigger if exists sync_employee_directory_after_profile_change on public.profiles;

create trigger sync_employee_directory_after_profile_change
  after insert or update of full_name, email, department, "position", is_active
  on public.profiles
  for each row
  execute function public.sync_employee_directory_from_profile();

-- ---------------------------------------------------------------------------
-- 4. auth.users email confirmation trigger
-- ---------------------------------------------------------------------------
create or replace function public.sync_employee_directory_after_auth_confirm()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.email_confirmed_at is not null
     and (old.email_confirmed_at is null or old.email_confirmed_at is distinct from new.email_confirmed_at) then
    perform public.upsert_employee_directory_for_profile(new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists sync_employee_directory_after_auth_confirm on auth.users;

create trigger sync_employee_directory_after_auth_confirm
  after update of email_confirmed_at
  on auth.users
  for each row
  execute function public.sync_employee_directory_after_auth_confirm();

-- ---------------------------------------------------------------------------
-- 5. Backfill existing profiles
-- ---------------------------------------------------------------------------
do $$
declare
  v_profile_id uuid;
begin
  for v_profile_id in select id from public.profiles
  loop
    perform public.upsert_employee_directory_for_profile(v_profile_id);
  end loop;
end;
$$;
