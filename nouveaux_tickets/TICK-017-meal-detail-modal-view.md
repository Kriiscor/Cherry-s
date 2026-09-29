# [TICK-017] feat(meal): Modal de Détail d'un Repas (Zoom Photo, Ingrédients & Répartition Macro)

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite cliquer sur n'importe quel repas dans ma timeline quotidienne pour ouvrir une vue détaillée complète affichant la photo agrandie, le découpage des ingrédients et les graphiques de répartition macro.
- **Règles de gestion** :
  - Accessibilité : `Dialog` centré sur Desktop et `Drawer` fluide sur Mobile.
  - Zoom photo interactif (lightbox / agrandissement sans perte).
  - Liste détaillée des `meal_items` avec grammage, calories et macronutriments (Protéines, Glucides, Lipides).
  - Option d'édition rapide ou de suppression sécurisée.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Clic sur une carte de repas déclenchant l'ouverture de la modal `MealDetailModal`.
- [ ] Visualisation haute définition de la photo de repas (avec fallback icône si pas de photo).
- [ ] Tableau interactif des ingrédients avec sous-totaux dynamiques.
- [ ] Graphique camembert/donut (`Recharts` ou `shadcn/ui` Chart) illustrant le % de Protéines, Glucides et Lipides.
- [ ] Action "Éditer" rouvrant la modal d'édition (`TICK-010`) et "Supprimer" avec confirmation `AlertDialog`.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Requête Supabase : `SELECT * FROM meals JOIN meal_items ON meals.id = meal_items.meal_id WHERE meals.id = ? AND meals.user_id = auth.uid()`.

### ⚙️ Périmètre Backend & API (Agent Backend & Security)
- **Route** : `GET /api/meals/[id]`
- **Sécurité** : Validation du jeton JWT Supabase `auth.uid() = meal.user_id`. Empêcher l'accès aux repas d'autres utilisateurs (`403 Forbidden`).

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/meals/components/MealDetailModal.tsx`
- **Composants `shadcn/ui`** : `Dialog`, `Drawer`, `Badge`, `Table`, `Button`, `AlertDialog`, `Chart`.
- **Hooks** : `useMealDetailQuery(mealId)`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Nominal** : Cliquer sur le repas "Poulet Riz" de 12:45 $\rightarrow$ Ouverture de la modal avec photo agrandie et tableau des 2 ingrédients.
- **Test Sécurité** : Essayer d'interroger `/api/meals/[id_autre_user]` $\rightarrow$ Retourne HTTP `403 Forbidden`.
