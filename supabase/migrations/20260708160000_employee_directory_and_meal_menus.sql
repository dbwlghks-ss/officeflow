-- Employee directory (Assistant-safe lookup) + meal menus
-- Apply in Supabase SQL Editor or via `supabase db push` when migrations are wired.
-- Does NOT modify existing profiles / meal_services tables.

-- ---------------------------------------------------------------------------
-- employee_directory
-- ---------------------------------------------------------------------------
create table if not exists public.employee_directory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text,
  position text,
  work_email text,
  extension text,
  work_phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employee_directory_name_idx on public.employee_directory (name);
create index if not exists employee_directory_active_idx on public.employee_directory (is_active);

alter table public.employee_directory enable row level security;

drop policy if exists "employee_directory_select_authenticated" on public.employee_directory;
create policy "employee_directory_select_authenticated"
  on public.employee_directory
  for select
  to authenticated
  using (is_active = true);

-- Admin write (reuses public.is_admin() from confirmed_profiles.sql)
drop policy if exists "employee_directory_admin_insert" on public.employee_directory;
create policy "employee_directory_admin_insert"
  on public.employee_directory
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "employee_directory_admin_update" on public.employee_directory;
create policy "employee_directory_admin_update"
  on public.employee_directory
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "employee_directory_admin_delete" on public.employee_directory;
create policy "employee_directory_admin_delete"
  on public.employee_directory
  for delete
  to authenticated
  using (public.is_admin());

-- Optional seed (uncomment after applying migration):
-- insert into public.employee_directory (name, department, position, work_email, extension, work_phone)
-- values
--   ('홍길동', '생산관리팀', '대리', 'hong@example.com', '1234', '031-000-0000'),
--   ('김철수', '품질관리팀', '사원', 'kim@example.com', '5678', null)
-- on conflict do nothing;

-- ---------------------------------------------------------------------------
-- meal_menus
-- ---------------------------------------------------------------------------
create table if not exists public.meal_menus (
  id uuid primary key default gen_random_uuid(),
  menu_date date not null,
  meal_type text not null default 'lunch',
  items text[] not null default '{}',
  note text,
  calories integer,
  cafeteria text not null default 'main',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (menu_date, meal_type, cafeteria)
);

create index if not exists meal_menus_date_idx on public.meal_menus (menu_date, meal_type);

alter table public.meal_menus enable row level security;

drop policy if exists "meal_menus_select_published" on public.meal_menus;
create policy "meal_menus_select_published"
  on public.meal_menus
  for select
  to authenticated
  using (is_published = true);

drop policy if exists "meal_menus_admin_insert" on public.meal_menus;
create policy "meal_menus_admin_insert"
  on public.meal_menus
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "meal_menus_admin_update" on public.meal_menus;
create policy "meal_menus_admin_update"
  on public.meal_menus
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "meal_menus_admin_delete" on public.meal_menus;
create policy "meal_menus_admin_delete"
  on public.meal_menus
  for delete
  to authenticated
  using (public.is_admin());

-- Optional seed for today's lunch (replace menu_date with current KST date):
-- insert into public.meal_menus (menu_date, meal_type, items, note, cafeteria)
-- values (
--   current_date,
--   'lunch',
--   array['백미밥', '된장찌개', '제육볶음', '배추김치'],
--   'A동 구내식당 기준',
--   'main'
-- )
-- on conflict (menu_date, meal_type, cafeteria) do update
-- set items = excluded.items, note = excluded.note, is_published = true;
