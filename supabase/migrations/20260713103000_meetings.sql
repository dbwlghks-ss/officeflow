-- Meeting minutes storage + extracted action items
-- Apply in Supabase SQL Editor or via `supabase db push`.

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text,
  raw_text text not null,
  summary text,
  decisions jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  follow_up_questions jsonb not null default '[]'::jsonb,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.meeting_action_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  task_title text not null,
  description text,
  owner_name text,
  owner_id uuid references auth.users (id) on delete set null,
  due_label text,
  due_date date,
  priority text not null default 'medium',
  status text not null default 'todo',
  evidence_text text,
  confidence numeric,
  created_at timestamptz not null default now()
);

create index if not exists meetings_created_by_idx on public.meetings (created_by, created_at desc);
create index if not exists meeting_action_items_meeting_id_idx on public.meeting_action_items (meeting_id);
create index if not exists meeting_action_items_status_idx on public.meeting_action_items (status);

alter table public.meetings enable row level security;
alter table public.meeting_action_items enable row level security;

drop policy if exists "meetings_select_own" on public.meetings;
create policy "meetings_select_own"
  on public.meetings
  for select
  to authenticated
  using (created_by = auth.uid());

drop policy if exists "meetings_insert_own" on public.meetings;
create policy "meetings_insert_own"
  on public.meetings
  for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists "meeting_action_items_select_own" on public.meeting_action_items;
create policy "meeting_action_items_select_own"
  on public.meeting_action_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.meetings m
      where m.id = meeting_action_items.meeting_id
        and m.created_by = auth.uid()
    )
  );

drop policy if exists "meeting_action_items_insert_own" on public.meeting_action_items;
create policy "meeting_action_items_insert_own"
  on public.meeting_action_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.meetings m
      where m.id = meeting_action_items.meeting_id
        and m.created_by = auth.uid()
    )
  );

drop policy if exists "meeting_action_items_update_own" on public.meeting_action_items;
create policy "meeting_action_items_update_own"
  on public.meeting_action_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.meetings m
      where m.id = meeting_action_items.meeting_id
        and m.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.meetings m
      where m.id = meeting_action_items.meeting_id
        and m.created_by = auth.uid()
    )
  );
