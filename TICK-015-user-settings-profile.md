# [TICK-015] feat(settings): Gestion du Profil Utilisateur et Préférences

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite modifier mes objectifs caloriques, mon nom ou mes préférences de compte.
- **Règles de gestion** :
  - Mise à jour en temps réel sans déconnexion.
  - Bouton de déconnexion sécurisé (purge des cookies de session).

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Page de paramètres accessible depuis la barre de navigation.
- [ ] Formulaire de modification du nom et des cibles de macronutriments.
- [ ] Toast de confirmation après sauvegarde.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Update sur `profiles` et `user_goals`.

### ⚙️ Périmètre Backend & API (Agent Backend)
- Server Action ou Route `PATCH /api/user/settings`.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/settings/`
- **Composants `shadcn/ui`** : `Card`, `Form`, `Input`, `Button`, `Switch`, `Sonner`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Modification** : Changer la cible calorique de 2000 à 2200 kcal $\rightarrow$ Sauvegarde effectuée et visualisée immédiatement sur le Dashboard.
