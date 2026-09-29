# [TICK-026] feat(gamification): Système d'Encouragement Continu, Séries (Streaks) & Badges de Récompenses

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite recevoir des encouragements bienveillants, fêter mes micro-victoires (séries de jours consécutifs, objectifs d'eau ou de protéines atteints, paliers de poids franchis) et débloquer des badges afin de rester motivé au quotidien sans sentiment de culpabilité.
- **Règles de gestion & Philosophie UX** :
  - **Ton 100% Positif & Bienveillant** : Aucun message culpabilisant ou rouge agressif en cas d'excès. Les écarts sont traités comme une source d'énergie et d'apprentissage.
  - **Système de Séries (Streaks 🔥)** : Comptage des jours consécutifs où l'utilisateur enregistre au moins un repas ou une hydratation. Octroi d'un "Joker de repos" par semaine pour ne pas briser la série en cas d'imprévu.
  - **Micro-Célébrations Visuelles (Confettis / Visual Feedback)** :
    - Atteinte des 100% d'hydratation $\rightarrow$ Animation confettis + Jauge vert émeraude.
    - Séance de sport enregistrée $\rightarrow$ Badge "💪 Énergie Débloquée !".
    - Palier de poids atteint $\rightarrow$ Carte de félicitations personnalisée.
  - **Système de Trophées & Badges** : Déblocage de badges visuels (Premier Scan 📷, Maître de l'Eau 💧, Semaine Parfaite 🌟, Legend Cherry's 🍒).

## 2. ✅ Critères d me d'Acceptation (Definition of Done)
- [ ] Composant `StreakCounter` (Flamme de série) intégré dans l'en-tête du Dashboard.
- [ ] Module de détection d'accomplissement déclenchant des confettis légers (`canvas-confetti`).
- [ ] Ton du Coach IA configuré avec des règles de réécriture empathiques.
- [ ] Page / Modal "Mes Trophées & Badges" (`TrophiesModal`).

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- **Tables & Colonnes** :
  - `profiles.current_streak` (int)
  - `profiles.best_streak` (int)
  - `profiles.last_active_date` (date)
  - Table `user_badges` (`id`, `user_id`, `badge_code`, `unlocked_at`).

### ⚙️ Périmètre Backend & API (Agent Backend & Security)
- **Routes** : `GET /api/user/badges`, `POST /api/user/streak/check`.
- **Prompt Coach IA** : Instruction système imposant la bienveillance ("Never scold or guilt-trip the user. Praise efforts, reframe overages as energy for workouts").

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/gamification/`
- **Composants `shadcn/ui`** : `Flame icon`, `Trophy icon`, `Dialog`, `Badge`, `Toast`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Gamification** : Enregistrer le 7ème jour consécutif $\rightarrow$ La flamme affiche "7 jours 🔥" et un toast de félicitations s'affiche avec confettis.
