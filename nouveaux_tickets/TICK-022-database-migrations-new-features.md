# [TICK-022] database(schema): Migrations SQL Supabase pour le Sport, le Poids et l'Eau

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant que développeur, je souhaite exécuter la migration de base de données PostgreSQL pour créer les nouvelles tables nécessaires aux modules Sport, Poids et Hydratation avec leurs règles RLS.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Script `supabase/migrations/002_sports_weight_hydration.sql` prêt.
- [ ] Tables créées : `sports_activities`, `weight_logs`, `hydration_logs`.
- [ ] Politiques RLS actives (`auth.uid() = user_id`) sur les 3 nouvelles tables.
- [ ] Indexation des colonnes `user_id` et `logged_at` pour des performances optimales.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Script SQL de Migration
```sql
-- 1. Table Sport & Activités Physiques
CREATE TABLE sports_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_name TEXT NOT NULL,
  met_value NUMERIC(4,2) NOT NULL,
  duration_minutes INT NOT NULL,
  calories_burned INT NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Table Pesées Poids
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight_kg NUMERIC(5,2) NOT NULL,
  note TEXT,
  logged_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Table Tracker d'Eau
CREATE TABLE hydration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_ml INT NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Activer RLS
ALTER TABLE sports_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Utilisateurs gèrent leurs sports" ON sports_activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Utilisateurs gèrent leur poids" ON weight_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Utilisateurs gèrent leur eau" ON hydration_logs FOR ALL USING (auth.uid() = user_id);
```

## 4. 🧪 Scénarios de Validation
- Exécuter la migration dans l'éditeur Supabase SQL Editor et vérifier qu'aucune erreur n'est retournée.
