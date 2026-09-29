# [TICK-001] setup(project): Initialisation du Projet Next.js 14+ / TypeScript / Tailwind

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant que développeur, je souhaite disposer d'un projet web moderne initialisé avec Next.js App Router, TypeScript et Tailwind CSS afin de pouvoir construire l'application NutriVision AI.
- **Règles de gestion** :
  - Utiliser la version LTS de Node.js.
  - Activer la rigueur TypeScript (`strict: true`).
  - Définir une arborescence claire par feature (`src/features/...`, `src/components/...`, `src/lib/...`).

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Projet compilable sans avertissement ni erreur (`pnpm dev` ou `npm run dev`).
- [ ] Tailwind CSS opérationnel avec les directives `@tailwind base; @tailwind components; @tailwind utilities;`.
- [ ] Layout de base responsive (Viewport Meta Tag configuré pour mobile & desktop).

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Aucun impact BDD sur ce ticket initial.

### ⚙️ Périmètre Backend & API (Agent Backend)
- Configuration des variables d'environnement (`.env.local`, `.env.example`).
- Structure des alias d'import `@/*` configurée dans `tsconfig.json`.
- **Provisioning Upstash Redis (optionnel)** : `@upstash/ratelimit` (introduit en TICK-005/TICK-016) nécessite un compte Upstash Redis, mais ce n'est **pas bloquant** pour le développement local. Prévoir les variables `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` dans `.env.example` (valeurs vides acceptées) ; le rate limiting doit fonctionner en mode "no-op" (désactivé, sans erreur) tant que ces variables ne sont pas renseignées.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/app/layout.tsx`, `src/app/page.tsx`
- **Configuration** : `tailwind.config.ts`, `postcss.config.mjs`
- **UI & Feedback** : Écran d'accueil temporaire confirmant l'initialisation du projet.
- **PWA iOS (Add to Home Screen)** : Ajouter les bases nécessaires à l'installabilité sur iOS Safari :
  - Un `manifest.json` (`name`, `short_name`, icônes 192px/512px, `display: "standalone"`, `theme_color`, `background_color`).
  - Dans le `<head>` de `src/app/layout.tsx` : `<meta name="apple-mobile-web-app-capable" content="yes">` et un lien `apple-touch-icon`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Nominal** : Lancer `npm run build` et vérifier le succès de la compilation.
- **Checklist Qualité** : `npm run lint` retourne 0 erreur.
