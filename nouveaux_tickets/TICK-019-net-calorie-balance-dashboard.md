# [TICK-019] feat(dashboard): Calcul et Affichage du Bilan Calorique Net

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite voir sur mon tableau de bord quotidien mon Bilan Calorique Net calculé à partir de mes repas consommés et des calories dépensées lors de mes séances de sport.
- **Règles de gestion** :
  - Formula : $\text{Calories Nettes} = \text{Calories Repas Consommées} - \text{Calories Sport Brûlées}$.
  - Exemple : Si l'utilisateur mange 2 000 kcal et brûle 400 kcal au sport, son total net est de **1 600 kcal**, lui laissant plus de marge par rapport à son objectif quotidien.
  - Carte interactive avec indicateur dynamique.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Section du Dashboard intégrant la carte "Bilan Calorique Net".
- [ ] Décomposition claire : `Mange : +2000 kcal` | `Brûlé : -400 kcal` = `Net : 1600 kcal`.
- [ ] Jauge de progression recalibrée prenant en compte les calories nettes vs l'objectif cible.
- [ ] Mise à jour en temps réel lors de l'ajout d'un repas ou d'une activité sportive.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Agrégation Supabase : `SUM(meals.total_calories)` et `SUM(sports_activities.calories_burned)` regroupés par date du jour.

### ⚙️ Périmètre Backend & API (Agent Backend & Security)
- Endpoint ou Hook React Query combinant les totaux : `useDailyNetBalance(date)`.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/dashboard/components/NetCalorieCard.tsx`
- **Composants `shadcn/ui`** : `Card`, `Progress`, `Badge`, `Flame`, `Activity`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Nominal** : Ajouter une séance de 300 kcal de natation $\rightarrow$ Le bilan net diminue immédiatement de 300 kcal et la jauge s'ajuste.
