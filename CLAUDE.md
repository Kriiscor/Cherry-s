# 🍏 NutriVision AI / App Cherry - Directives et Instructions du Projet

Ce fichier définit l'ensemble des directives de développement, de sécurité et d'architecture que tous les agents IA et développeurs doivent respecter lors de l'exécution des tickets du projet.

---

## 🚀 1. Commandes de Développement & Build

```bash
# Lancer le serveur de développement local
pnpm dev

# Compiler l'application pour la production
pnpm build

# Exécuter la vérification du typage TypeScript
pnpm type-check

# Exécuter les linter et formateurs de code
pnpm lint

# Exécuter la suite de tests unitaires et d'intégration backend (Vitest)
pnpm test:backend
```

---

## 📐 2. Principes d'Architecture & Structure des Dossiers

L'application suit une **Architecture Orientée Features (Feature-Driven Architecture)** :

```
src/
├── app/                  # App Router Next.js (layout, pages, api routes)
│   ├── api/              # API Proxy Routes (ai/analyze-meal, ai/weekly-summary)
│   └── (dashboard)/      # Pages protégées (dashboard, analytics, settings)
├── components/           # Composants UI partagés
│   └── ui/               # Composants shadcn/ui (Button, Card, Dialog, Drawer...)
├── features/             # Modules métier autonomes
│   ├── auth/             # Connexion / Inscription / Session
│   ├── meals/            # Prise de photo, édition IA & timeline des repas
│   ├── analytics/        # Graphiques Recharts & Bilan hebdomadaire IA
│   └── onboarding/       # Assistant de configuration des objectifs
├── lib/                  # Utilitaires, clients API et schémas Zod
│   ├── supabase/         # Clients Supabase (browser.ts, server.ts)
│   ├── replicate/        # Configuration du SDK Replicate
│   └── validators/       # Schémas de validation Zod
```

---

## 🎨 3. Normes Frontend (`shadcn/ui` & React)

1. **Composants `shadcn/ui` Obligatoires** : Toujours réutiliser les composants standard de `@/components/ui/`. Ne pas recréer de composants de base (ex: boutons, inputs, modals).
2. **Design Responsive Mobile-First** :
   - Sur mobile (< 768px) : Privilégier les `Drawer` (remontant du bas).
   - Sur desktop (≥ 768px) : Privilégier les `Dialog` centrés.
3. **Formulaires & Zod** : Utiliser `react-hook-form` avec les résolveurs `zod`.
4. **Icons** : Importer exclusivement depuis `lucide-react`.

---

## ⚙️ 4. Normes Backend & Sécurité (Supabase & Replicate)

1. **Validation Stricte des Entrées** : Valider 100% des payloads API reçus avec un schéma Zod (`z.object(...)`).
2. **Isolation des Clés API (Zero Secret Leak)** :
   - `REPLICATE_API_TOKEN` et `SUPABASE_SERVICE_ROLE_KEY` doivent être **exclusivement lus côté serveur**.
   - Ne JAMAIS exposer ou préfixer ces variables par `NEXT_PUBLIC_`.
3. **Sécurité PostgreSQL RLS** : Toutes les requêtes Supabase doivent appliquer la vérification `auth.uid() = user_id`.
4. **Protection Rate Limiting & Anti-XSS** :
   - Limiter les requêtes sur les routes `/api/ai/*` via `@upstash/ratelimit`.
   - Purifier le contenu Markdown généré par l'IA via `DOMPurify` avant affichage.

---

## 🧪 5. Normes de Tests Automatisés Backend

1. **Tests d'Intégration** : Chaque endpoint d'API (`/api/ai/*`) doit être couvert par un test Vitest avec des mocks **MSW (Mock Service Worker)** pour intercepter les requêtes Replicate hors-ligne.
2. **Vérification de Typage Strict** : `pnpm type-check` doit retourner **0 erreur**.
