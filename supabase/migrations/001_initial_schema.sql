-- ============================================================
-- NutriVision AI / App Cherry — Migration initiale (TICK-004)
-- Tables : profiles, user_goals, meals, meal_items, weekly_reports
-- + RLS complet + trigger auto-création profil + bucket photos
-- ============================================================

-- ------------------------------------------------------------
-- 1. profiles
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ------------------------------------------------------------
-- 2. user_goals
-- ------------------------------------------------------------
create table public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  daily_calories int not null check (daily_calories > 0),
  protein_grams int not null check (protein_grams >= 0),
  carbs_grams int not null check (carbs_grams >= 0),
  fat_grams int not null check (fat_grams >= 0),
  weight_kg numeric(5,2) not null check (weight_kg > 0),
  height_cm numeric(5,1) not null check (height_cm > 0),
  age int not null check (age > 0),
  sex text not null check (sex in ('male', 'female')),
  activity_level text not null check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal_type text not null check (goal_type in ('lose', 'maintain', 'gain')),
  updated_at timestamptz not null default now()
);

alter table public.user_goals enable row level security;

create policy "user_goals_all_own" on public.user_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. meals
-- ------------------------------------------------------------
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  photo_url text,
  total_calories int not null default 0 check (total_calories >= 0),
  total_protein int not null default 0 check (total_protein >= 0),
  total_carbs int not null default 0 check (total_carbs >= 0),
  total_fat int not null default 0 check (total_fat >= 0),
  logged_at timestamptz not null default now()
);

create index meals_user_id_logged_at_idx on public.meals (user_id, logged_at desc);

alter table public.meals enable row level security;

create policy "meals_all_own" on public.meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. meal_items (pas de user_id direct — RLS via jointure meals)
-- ------------------------------------------------------------
create table public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  item_name text not null check (char_length(trim(item_name)) > 0),
  weight_grams int not null check (weight_grams > 0),
  calories int not null check (calories >= 0),
  protein int not null check (protein >= 0),
  carbs int not null check (carbs >= 0),
  fat int not null check (fat >= 0)
);

create index meal_items_meal_id_idx on public.meal_items (meal_id);

alter table public.meal_items enable row level security;

create policy "meal_items_all_own" on public.meal_items
  for all using (
    exists (
      select 1 from public.meals
      where meals.id = meal_items.meal_id
        and meals.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.meals
      where meals.id = meal_items.meal_id
        and meals.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 5. weekly_reports
-- Contrainte unique (user_id, week_start_date) : un seul rapport
-- par utilisateur et par semaine, pour éviter les doublons lors
-- d'une régénération (bouton "Regénérer" de TICK-014).
-- ------------------------------------------------------------
create table public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null,
  quality_score int not null check (quality_score between 0 and 100),
  ai_advice_markdown text,
  created_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

alter table public.weekly_reports enable row level security;

create policy "weekly_reports_all_own" on public.weekly_reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 6. Trigger : auto-création du profil à l'inscription (signup)
-- ------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 7. Storage bucket pour les photos de repas (TICK-009)
-- Chemin conventionnel : meal-photos/{user_id}/{uuid}.{ext}
-- La policy restreint chaque utilisateur à son propre préfixe.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', false)
on conflict (id) do nothing;

create policy "meal_photos_all_own" on storage.objects
  for all using (
    bucket_id = 'meal-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'meal-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
