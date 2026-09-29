# [TICK-004] database(schema): Migration Schémas PostgreSQL & RLS Supabase

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite que mes repas, mes objectifs nutritionnels et mes bilans soient sauvegardés de façon strictement privée et isolée.
- **Règles de gestion** :
  - Politique RLS : Un utilisateur ne peut lire/écrire que ses propres lignes (`auth.uid() = user_id`).
  - Cascading deletes : La suppression d'un repas supprime automatiquement les éléments d'aliments associés.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Scripts SQL créés dans `supabase/migrations/001_initial_schema.sql`.
- [ ] Tables créées : `profiles`, `user_goals`, `meals`, `meal_items`, `weekly_reports`.
- [ ] Row Level Security (RLS) activé sur l'ensemble des 5 tables.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- **Modèles & Schémas** :
  - `profiles` : `id (UUID, PK, FK auth.users.id)`, `email (text)`, `full_name (text)`, `created_at (timestamptz)`
  - `user_goals` : `id (UUID, PK)`, `user_id (UUID, FK auth.users.id, UNIQUE)`, `daily_calories (int)`, `protein_grams (int)`, `carbs_grams (int)`, `fat_grams (int)`, `weight_kg (numeric(5,2))`, `height_cm (numeric(5,1))`, `age (int)`, `sex (text, CHECK IN ('male','female'))`, `activity_level (text, CHECK IN ('sedentary','light','moderate','active','very_active'))`, `goal_type (text, CHECK IN ('lose','maintain','gain'))`, `updated_at (timestamptz)`
    - *Note : la contrainte `UNIQUE(user_id)` garantit une seule ligne d'objectifs par utilisateur (upsert lors de l'onboarding TICK-008 et des mises à jour TICK-015). Les champs physiques (poids/taille/âge/sexe/activité) sont nécessaires au calcul Mifflin-St Jeor de TICK-008 et n'existaient dans aucune autre table.*
  - `meals` : `id (UUID)`, `user_id (UUID)`, `meal_type (text)`, `photo_url (text)`, `total_calories (int)`, `total_protein (int)`, `total_carbs (int)`, `total_fat (int)`, `logged_at (timestamptz)`
  - `meal_items` : `id (UUID)`, `meal_id (UUID, FK meals.id ON DELETE CASCADE)`, `item_name (text)`, `weight_grams (int, CHECK > 0)`, `calories (int, CHECK >= 0)`, `protein (int, CHECK >= 0)`, `carbs (int, CHECK >= 0)`, `fat (int, CHECK >= 0)`
    - *Note : pas de colonne `user_id` directe — l'appartenance se déduit via `meal_id → meals.user_id` (voir policy RLS ci-dessous).*
  - `weekly_reports` : `id (UUID)`, `user_id (UUID)`, `week_start_date (date)`, `quality_score (int, CHECK BETWEEN 0 AND 100)`, `ai_advice_markdown (text)`, `created_at (timestamptz)`

- **Policies RLS explicites** (une par table, `FOR ALL USING/WITH CHECK`) :
  - `profiles` : `auth.uid() = id`
  - `user_goals` : `auth.uid() = user_id`
  - `meals` : `auth.uid() = user_id`
  - `meal_items` : `EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid())` — policy par sous-requête car pas de `user_id` direct.
  - `weekly_reports` : `auth.uid() = user_id`

### ⚙️ Périmètre Backend & API (Agent Backend)
- Définition des déclencheurs (Triggers) d'auto-création de profil lors d'un `SIGNUP`.
- Le calcul du `quality_score` de `weekly_reports` est spécifié dans TICK-006 (formule à documenter là-bas, cette table ne fait qu'y appliquer une contrainte `CHECK BETWEEN 0 AND 100`).

### 🎨 Périmètre Frontend (Agent Frontend)
- Aucun impact direct frontend (consommation via Supabase Client).

## 4. 🧪 Scénarios de Validation & Tests
- **Test Sécurité** : Essayer d'interroger la table `meals` avec le Token JWT de l'Utilisateur A et l'ID de l'Utilisateur B $\rightarrow$ doit retourner 0 ligne.
- **Test Sécurité** : Idem sur `meal_items` (via un `meal_id` appartenant à l'Utilisateur B) $\rightarrow$ doit retourner 0 ligne malgré l'absence de `user_id` direct.
- **Test Contrainte** : Tenter d'insérer une deuxième ligne `user_goals` pour le même `user_id` $\rightarrow$ doit échouer (violation `UNIQUE`).
