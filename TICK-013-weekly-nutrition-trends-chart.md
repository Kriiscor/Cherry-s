# [TICK-013] feat(analytics): Graphique des Tendances Nutritionnelles sur 7 Jours

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite visualiser l'évolution de mes apports sur la semaine pour repérer mes jours d'excès ou de sous-alimentation.
- **Règles de gestion** :
  - Graphique en barres ou courbes sur 7 jours glissants.
  - Ligne de référence représentant l'objectif quotidien.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Graphique intégrant `Recharts` ou le composant Chart `shadcn/ui`.
- [ ] Switcher d'affichage : Vue Calories vs Vue Protéines.
- [ ] Info-bulles interactives (Tooltips) affichant le sous-total au survol.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- **Requête filtrée Supabase (pas de RPC)** : par cohérence avec le pattern de requêtes plus simple utilisé ailleurs dans les tickets (cf. TICK-011/TICK-012), utiliser une requête client Supabase filtrée sur `meals`, groupée/agrégée par jour, pour les 7 derniers jours de l'utilisateur courant (`auth.uid() = user_id`) — pas de fonction RPC.
- Les objectifs cibles sont joints de façon conceptuelle (requête séparée) depuis `user_goals` (cf. TICK-004) pour construire la ligne de référence.

### ⚙️ Périmètre Backend & API (Agent Backend)
- **Contrat de données strict** : le frontend doit recevoir un tableau de 7 entrées (du jour le plus ancien au plus récent), au format suivant :
  ```ts
  {
    date: string;        // ISO (ex: "2026-09-22")
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    target_calories: number;
  }[]
  ```

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/analytics/components/WeeklyTrendsChart.tsx`
- **Composants `shadcn/ui`** : `Card`, `Tabs`, `Chart`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Rendu** : Vérifier la lisibilité du graphique sur un écran de smartphone 375px.
