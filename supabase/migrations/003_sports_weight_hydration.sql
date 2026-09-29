-- ============================================================
-- Cherry's — Migration 003 (TICK-022)
-- Tables : sports_activities, weight_logs, hydration_logs
-- + RLS complet (auth.uid() = user_id) + index (user_id, logged_at)
-- Modules Sport (TICK-018), Poids/IMC (TICK-020), Hydratation (TICK-021).
-- ============================================================

-- ------------------------------------------------------------
-- 1. sports_activities — séances de sport & calories brûlées
-- calories_burned = MET * poids_kg * (duration_minutes / 60)
-- ------------------------------------------------------------
create table public.sports_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_name text not null check (char_length(trim(activity_name)) > 0),
  met_value numeric(4,2) not null check (met_value > 0),
  duration_minutes int not null check (duration_minutes between 1 and 1440),
  calories_burned int not null check (calories_burned between 1 and 10000),
  logged_at timestamptz not null default now()
);

create index sports_activities_user_id_logged_at_idx
  on public.sports_activities (user_id, logged_at desc);

alter table public.sports_activities enable row level security;

create policy "sports_activities_all_own" on public.sports_activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 2. weight_logs — pesées régulières
-- ------------------------------------------------------------
create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric(5,2) not null check (weight_kg between 20 and 300),
  note text,
  logged_at timestamptz not null default now()
);

create index weight_logs_user_id_logged_at_idx
  on public.weight_logs (user_id, logged_at desc);

alter table public.weight_logs enable row level security;

create policy "weight_logs_all_own" on public.weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. hydration_logs — ajouts d'eau (ml)
-- ------------------------------------------------------------
create table public.hydration_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_ml int not null check (amount_ml between 1 and 5000),
  logged_at timestamptz not null default now()
);

create index hydration_logs_user_id_logged_at_idx
  on public.hydration_logs (user_id, logged_at desc);

alter table public.hydration_logs enable row level security;

create policy "hydration_logs_all_own" on public.hydration_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
