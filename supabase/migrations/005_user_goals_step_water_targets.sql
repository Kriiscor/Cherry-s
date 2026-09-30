-- ============================================================
-- Cherry's — Migration 005
-- user_goals : ajout des objectifs pas/jour et hydratation/jour
-- Colonnes optionnelles avec valeurs par défaut — rétrocompatibles.
-- ============================================================

alter table public.user_goals
  add column daily_steps_goal int not null default 10000
    check (daily_steps_goal between 1000 and 100000),
  add column daily_water_ml int not null default 2500
    check (daily_water_ml between 500 and 10000);
