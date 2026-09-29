# [TICK-008] feat(onboarding): Assistant de Configuration des Objectifs Nutritionnels

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant que nouvel utilisateur, je souhaite renseigner mon profil (poids, taille, objectif) pour que l'application calcule automatiquement mes besoins en calories et macronutriments.
- **Règles de gestion** :
  - Formule Mifflin-St Jeor pour le besoin calorique de base (MB).
  - Facteur d'activité (Sédentaire 1.2, Modéré 1.55, Très actif 1.725).
  - Répartition des macros selon l'objectif (Perte de poids, Maintien, Prise de masse).

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Assistant pas à pas en 3 étapes avec barre de progression `shadcn/ui`.
- [ ] Calcul dynamique des valeurs recommandées avec possibilité d'ajustement par sliders.
- [ ] Sauvegarde des données dans `user_goals`.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Insertion/Mise à jour dans `user_goals` via `UPSERT` sur `user_id` (colonne `UNIQUE`) : `weight_kg, height_cm, age, sex, activity_level, goal_type, daily_calories, protein_grams, carbs_grams, fat_grams, updated_at`.

### ⚙️ Périmètre Backend & API (Agent Backend)
- Server Action ou Route `POST /api/user/goals`.
- **Formule Mifflin-St Jeor (BMR)** :
  - Homme (`sex = 'male'`) : `BMR = 10 × weight_kg + 6.25 × height_cm - 5 × age + 5`
  - Femme (`sex = 'female'`) : `BMR = 10 × weight_kg + 6.25 × height_cm - 5 × age - 161`
- **Facteurs d'activité (`TDEE = BMR × facteur`)**, alignés sur le `CHECK` de `activity_level` :
  - `sedentary` = 1.2 · `light` = 1.375 · `moderate` = 1.55 · `active` = 1.725 · `very_active` = 1.9
- **Ajustement selon `goal_type`** :
  - `lose` → `daily_calories = TDEE - 500`
  - `maintain` → `daily_calories = TDEE`
  - `gain` → `daily_calories = TDEE + 300`
- **Répartition des macros (% des `daily_calories`)** :
  - `lose` → 35% protéines / 35% glucides / 30% lipides
  - `maintain` → 30% protéines / 40% glucides / 30% lipides
  - `gain` → 25% protéines / 45% glucides / 30% lipides
  - Conversion en grammes (protéines/glucides = 4 kcal/g, lipides = 9 kcal/g) :
    - `protein_grams = (daily_calories × %protéines) / 4`
    - `carbs_grams = (daily_calories × %glucides) / 4`
    - `fat_grams = (daily_calories × %lipides) / 9`

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/onboarding/`
- **Composants `shadcn/ui`** : `Card`, `Slider`, `Select`, `RadioGroup`, `Button`, `Progress`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Nominal** : Compléter l'onboarding pour un profil Homme de 80kg pratiquant du sport 3x/semaine avec objectif perte de poids $\rightarrow$ Génère ~2200 kcal / ~195g protéines (35% des calories, cf. formule ci-dessus — décision produit confirmée : répartition en % des calories, pas en g/kg de poids corporel).
