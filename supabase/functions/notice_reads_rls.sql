-- notice_reads 읽음 처리 RLS (Supabase SQL Editor에서 필요 시 실행)
--
-- 공지 상세 열람 시 notice_reads insert/select가 거부되면 아래를 실행합니다.
-- 기존 notices 테이블 구조는 변경하지 않습니다.

alter table public.notice_reads enable row level security;

drop policy if exists "Users can read own notice_reads" on public.notice_reads;
create policy "Users can read own notice_reads"
  on public.notice_reads
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own notice_reads" on public.notice_reads;
create policy "Users can insert own notice_reads"
  on public.notice_reads
  for insert
  with check (auth.uid() = user_id);
