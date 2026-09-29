# [TICK-018] feat(sport): Module de Suivi du Sport & Activités Physiques

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite enregistrer mes séances de sport (type d'activité, durée en minutes) afin d'obtenir un calcul automatique des calories brûlées basé sur mon poids et l'intensité.
- **Règles de gestion** :
  - Catalogue d'activités prédéfinies basées sur l'index MET (Course à pied, Musculation, Vente/Marche, Natation, Vélo, HIIT, Yoga, etc.).
  - Formule de calcul : $\text{Calories Brûlées} = \text{MET} \times \text{Poids (kg)} \times \left(\frac{\text{Durée (min)}}{60}\right)$.
  - Saisie intuitive de la durée avec possibilité d'ajustement manuel du total de calories estimées.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Interface de saisie d'activité physique (`SportActivityModal`) sous forme de `Dialog`/`Drawer`.
- [ ] Selecteur avec recherche (`Command` / `Combobox` `shadcn/ui`) pour choisir le sport dans le catalogue MET.
- [ ] Calcul en temps réel des calories brûlées lorsque la durée ou l'activité change.
- [ ] Affichage de la liste des activités physiques de la journée dans le Dashboard.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- **Table** `sports_activities` :
  - `id (UUID, PK)`
  - `user_id (UUID, FK profiles.id)`
  - `activity_name (text)`
  - `met_value (numeric)`
  - `duration_minutes (int)`
  - `calories_burned (int)`
  - `logged_at (timestamptz)`
- Politique RLS : `auth.uid() = user_id`.

### ⚙️ Périmètre Backend & API (Agent Backend & Security)
- **Routes** :
  - `GET /api/sports/activities` (catalogue MET)
  - `POST /api/sports/log` (enregistrement de la séance)
  - `DELETE /api/sports/log/[id]` (suppression)
- **Validation Zod** : `duration_minutes` min 1, max 1440. `calories_burned` min 1, max 10000.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/sport/`
- **Composants `shadcn/ui`** : `Dialog`, `Drawer`, `Select`, `Command`, `Input`, `Button`, `Card`, `Dumbbell icon`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Nominal** : Un utilisateur de 80kg sélectionne "Course à pied (MET 9.8)" pour 30 minutes $\rightarrow$ Le système calcule $\approx 392 \text{ kcal}$ brûlées.
- **Test Invalidation** : Saisir une durée négative ou nulle $\rightarrow$ Validation Zod bloque avec message "Durée minimale 1 minute".
