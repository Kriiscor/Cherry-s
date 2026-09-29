# [TICK-010] feat(meal): Modal de Prévisualisation et Édition des Résultats IA

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite vérifier et ajuster les quantités ou les ingrédients identifiés par l'IA avant d'enregistrer définitivement mon repas.
- **Règles de gestion** :
  - Affichage de la liste des aliments sous forme de tableau éditable.
  - Modification dynamique du poids (ex: passer de 150g à 200g de poulet) recalculant automatiquement calories, protéines, glucides et lipides.
  - Possibilité de supprimer un ingrédient ou d'en ajouter un manuellement.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Modal `Dialog` affichant le sous-total calorique et macro en haut de fiche.
- [ ] Recalcul en temps réel lors du changement d'une valeur dans les champs `Input`.
- [ ] Bouton "Valider et Enregistrer" insérant le repas dans Supabase.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Transaction Supabase créant l'entrée `meals` et les entrées associées `meal_items`.

### ⚙️ Périmètre Backend & API (Agent Backend)
- Server Action ou Route `POST /api/meals/save`.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/meals/components/MealEditModal.tsx`
- **Composants `shadcn/ui`** : `Dialog`, `Table`, `Input`, `Button`, `Badge`, `Trash2 icon`.

### 🔒 Règles de Validation (avant écriture `meals` / `meal_items`)
- `weight_grams` doit être **> 0** (rejeter 0 ou une valeur négative).
- `calories`, `protein`, `carbs`, `fat` doivent être **>= 0**.
- `item_name` doit être non-vide, trimé (`trim()`), et nettoyé de tout contenu HTML/script avant insertion (référence croisée : cette sanitisation est appliquée côté serveur conformément à l'exigence du TICK-016, mais le frontend doit également valider via le schéma `zod` pour un retour utilisateur immédiat).
- Ces règles reflètent les contraintes `CHECK` désormais définies sur la table `meal_items` dans le TICK-004.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Édition** : Modifier la quantité de riz de 100g à 200g $\rightarrow$ Le total des glucides et calories du repas s'ajuste immédiatement à l'écran.
