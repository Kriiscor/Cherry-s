# [TICK-012] feat(dashboard): Chronologie des Repas de la Journée

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite consulter la liste de mes repas enregistrés dans la journée, organisés par heure et par type de repas.
- **Règles de gestion** :
  - Regroupement par catégorie (Petit-déjeuner, Déjeuner, Dîner, Collation).
  - Navigation temporelle (Jour précédent / Aujourd'hui / Jour suivant).
  - Suppression d'un repas après confirmation via `AlertDialog`.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Cartes de repas avec vignettes d'image si photo disponible.
- [ ] Affichage du détail des sous-totaux par repas (Calories & Protéines).
- [ ] Menu contextuel `DropdownMenu` avec options "Modifier" et "Supprimer".

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Suppression `DELETE FROM meals WHERE id = ?`.
- **Défense en profondeur** : L'appel de suppression (client ou serveur) doit explicitement filtrer par `user_id` en plus de l'`id`, sans se reposer uniquement sur la RLS. Exemple Supabase JS : `.from('meals').delete().eq('id', mealId).eq('user_id', user.id)`.

### ⚙️ Périmètre Backend & API (Agent Backend)
- Mutation React Query pour invalidation du cache de la journée.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/dashboard/components/MealTimeline.tsx`
- **Composants `shadcn/ui`** : `Card`, `DropdownMenu`, `AlertDialog`, `Avatar`, `Badge`, `Calendar`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Suppression** : Cliquer sur "Supprimer" un repas $\rightarrow$ Confirmation demandée $\rightarrow$ Le repas disparaît et les jauges se mettent à jour.
