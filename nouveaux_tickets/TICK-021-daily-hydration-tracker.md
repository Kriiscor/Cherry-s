# [TICK-021] feat(hydration): Tracker d'Hydratation Quotidien & Jauge Vert Félicitations

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite enregistrer rapidement ma consommation d'eau au cours de la journée pour m'assurer que je réponds à mes besoins en hydratation (ex: 2.5 Litres / jour) et recevoir un feedback visuel de félicitations dès l'objectif atteint.
- **Règles de gestion & Feedback Visuel** :
  - En cours d'atteinte (< 100%) : Jauge couleur Bleu Ciel (`bg-sky-500`).
  - **Objectif Atteint (≥ 100%)** :
    - Transition dynamique de la jauge vers un **Vert Émeraude Célébration** (`bg-gradient-to-r from-emerald-500 to-teal-500`).
    - Transformation du badge en **"🎉 Objectif Atteint !"** (`bg-emerald-100 text-emerald-800`).
    - Message de félicitations : *"👏 Bravo ! Hydratation parfaite pour la journée."*
  - Boutons d'ajout rapide un-clic : `+250ml` (Verre d'eau), `+500ml` (Gourde).

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Carte d'hydratation intégrée sur le Dashboard principal (`HydrationTrackerCard`).
- [ ] Swapping visuel dynamique de l'état de la carte (Bleu $\rightarrow$ Vert Émeraude Célébration) dès que `currentMl >= targetMl`.
- [ ] Mis à jour instantanée sans rechargement de page (Optimistic UI updates).

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- **Table** `hydration_logs` : `id`, `user_id`, `amount_ml`, `logged_at`.

### ⚙️ Périmètre Backend & API (Agent Backend & Security)
- **Routes** : `GET /api/hydration/daily`, `POST /api/hydration/add`.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/hydration/`
- **Composants `shadcn/ui`** : `Card`, `Progress`, `Button`, `CheckCircle2`, `PartyPopper`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Nominal (Célébration)** : Consommer 2 500 ml d'eau sur un objectif de 2 500 ml $\rightarrow$ La carte bascule immédiatement avec la jauge vert émeraude et le badge "🎉 Objectif Atteint !".
