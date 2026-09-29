# [TICK-007] feat(auth): Écran d'Authentification (Connexion / Inscription shadcn/ui)

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant que visiteur, je souhaite pouvoir créer un compte ou me connecter à mon compte existant pour accéder à mon suivi nutritionnel.
- **Règles de gestion** :
  - Inscription avec Email et Mot de passe.
  - Validation en temps réel de l'email et de la force du mot de passe (≥ 8 caractères).
  - Le mot de passe doit contenir au moins une lettre et un chiffre (pas de règles complexes supplémentaires).
  - Feedback d'erreur explicite en français.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Onglets `shadcn/ui` fluides entre "Connexion" et "Inscription".
- [ ] Gestion des états de chargement (`Button disabled`, `Spinner`).
- [ ] Redirection automatique vers `/dashboard` après connexion réussie.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Déclenchement automatique de la création de la ligne dans `profiles` via le trigger Supabase.

### ⚙️ Périmètre Backend & API (Agent Backend)
- Utilisation de `supabase.auth.signInWithPassword` et `supabase.auth.signUp`.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/auth/`
- **Composants `shadcn/ui`** : `Card`, `Tabs`, `Form`, `Input`, `Button`, `Label`, `Sonner`.
- **Validation** : `react-hook-form` avec le resolver `zod`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Nominal** : Saisir un email valide et un mot de passe $\rightarrow$ Connexion réussie et redirection `/dashboard`.
- **Test d'Erreur** : Mot de passe incorrect $\rightarrow$ Affichage d'un toast d'erreur "Identifiants invalides".
