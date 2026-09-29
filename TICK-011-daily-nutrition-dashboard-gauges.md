# [TICK-011] feat(dashboard): Jauges de Progression Calorique et Macronutriments

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite voir d'un coup d'œil où j'en suis dans ma journée au niveau de mes calories et de mes protéines par rapport à mes objectifs.
- **Règles de gestion** :
  - Jauge principale : Calories consommées vs Calories cible (ex: `1 650 / 2 200 kcal`).
  - Jauges secondaires : Protéines, Glucides, Lipides.
  - Couleurs adaptatives (Vert = Objectif en cours/atteint, Orange = Approche de la limite, Rouge = Dépassement).
  - **Seuils numériques des couleurs** : Vert = 0-100% de l'objectif quotidien, Orange = 100-110% (léger dépassement), Rouge = > 110% (dépassement significatif de l'objectif).

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Cartes `shadcn/ui` affichant les pourcentages d'accomplissement.
- [ ] Composants `Progress` animés à l'affichage.
- [ ] Recalcul automatique dès qu'un nouveau repas est ajouté dans la journée.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Requête agrégée `SUM(total_calories)`, `SUM(total_protein)`, `SUM(total_carbs)`, `SUM(total_fat)` filtrée par `user_id` et la date du jour.

### ⚙️ Périmètre Backend & API (Agent Backend)
- Supabase Query via TanStack Query (`useDailyTotals(date)`).
- Les valeurs cibles (`daily_calories`, `protein_grams`, `carbs_grams`, `fat_grams`) proviennent de la table `user_goals` (cf. TICK-004), récupérées via la même requête/hook que celui utilisé ailleurs dans l'application (ex: `useUserGoals()`), afin d'éviter toute duplication de la logique de récupération des objectifs.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/dashboard/components/DailyGauges.tsx`
- **Composants `shadcn/ui`** : `Card`, `Progress`, `Badge`, `Flame`, `Dumbbell`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Visualisation** : Ajouter un repas de 50g de protéines $\rightarrow$ La jauge de protéines progresse en direct sans recharger la page.
