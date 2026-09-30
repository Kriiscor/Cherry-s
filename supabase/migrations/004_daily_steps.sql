-- ============================================================
-- Cherry's — Migration 004
-- Table : daily_steps — compteur de pas journalier
-- Un enregistrement par utilisateur par jour (upsert).
-- RLS : auth.uid() = user_id
-- ============================================================

create table public.daily_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  step_count int not null check (step_count between 0 and 200000),
  logged_date date not null default current_date,
  unique (user_id, logged_date)
);

create index daily_steps_user_id_logged_date_idx
  on public.daily_steps (user_id, logged_date desc);

alter table public.daily_steps enable row level security;

create policy "daily_steps_all_own" on public.daily_steps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
