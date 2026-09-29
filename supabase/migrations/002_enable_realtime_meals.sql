-- ============================================================
-- Enable Supabase Realtime on `meals` (TICK-011/012)
-- Lets the dashboard's gauges/timeline invalidate their React Query
-- cache instantly when a meal is inserted/deleted, instead of relying
-- solely on the 5s polling fallback.
-- ============================================================

alter publication supabase_realtime add table public.meals;
