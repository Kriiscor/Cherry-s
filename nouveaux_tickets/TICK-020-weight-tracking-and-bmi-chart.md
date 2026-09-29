# [TICK-020] feat(analytics): Suivi de Courbe de Poids, Historique & Calcul IMC

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite enregistrer régulièrement mon poids (pesée quotidienne/hebdomadaire) et visualiser une courbe d'évolution avec mon IMC et mon objectif de poids.
- **Règles de gestion** :
  - Saisie rapide de la pesée en kilogrammes (avec option note / heure de pesée).
  - Calcul automatique de l'Indice de Masse Corporelle (IMC) : $\text{IMC} = \frac{\text{Poids (kg)}}{\text{Taille (m)}^2}$.
  - Graphique linéaire d'évolution (`Recharts` ou `shadcn/ui` Chart) avec courbe de tendance lissée et ligne d'objectif de poids.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Modal de saisie rapide de la pesée (`WeightLogModal`).
- [ ] Graphique d'évolution temporelle du poids (7 jours, 30 jours, 3 mois, Tout).
- [ ] Calcul et affichage de la variation (ex: `-1.5 kg ce mois-ci`) avec indicateur vert/orange.
- [ ] Badge d'interprétation IMC (Insuffisance pondérale, Corpulence normale, Surpoids, Obésité).

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- **Table** `weight_logs` :
  - `id (UUID, PK)`
  - `user_id (UUID, FK profiles.id)`
  - `weight_kg (numeric(5,2))`
  - `note (text, optional)`
  - `logged_at (timestamptz)`
- Politique RLS : `auth.uid() = user_id`.

### ⚙️ Périmètre Backend & API (Agent Backend & Security)
- **Routes** : `GET /api/weight/logs`, `POST /api/weight/log`, `DELETE /api/weight/log/[id]`.
- **Validation Zod** : `weight_kg` entre 20.0 kg et 300.0 kg.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/weight/`
- **Composants `shadcn/ui`** : `Card`, `Dialog`, `Drawer`, `Input`, `Button`, `Chart`, `Badge`, `TrendingDown icon`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Nominal** : Saisir 75.5 kg pour un utilisateur d'1m80 $\rightarrow$ IMC calculé = 23.3 (Corpulence normale) et courbe mise à jour.
