# [TICK-003] setup(supabase): Configuration du Client Supabase (SSR & Auth)

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant que développeur, je souhaite disposer d'un client Supabase configuré pour Next.js App Router (Server Components & Client Components) afin de gérer l'authentification et les données en temps réel.
- **Règles de gestion** :
  - Utiliser la bibliothèque officielle `@supabase/ssr`.
  - Séparer la création du client serveur (`createClient` pour Server Components / Server Actions) et du client navigateur (`createBrowserClient`).

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Client Supabase Navigateur instanciable via `@/lib/supabase/client.ts`.
- [ ] Client Supabase Serveur instanciable via `@/lib/supabase/server.ts`.
- [ ] Proxy Next.js (`src/proxy.ts`, export `proxy()` — anciennement `middleware.ts`/`middleware()`, renommé en Next.js 16) pour le rafraîchissement automatique des cookies de session.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Génération des types TypeScript Supabase via CLI (`supabase gen types typescript`).

### ⚙️ Périmètre Backend & API (Agent Backend)
- Variables d'environnement : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

### 🎨 Périmètre Frontend (Agent Frontend)
- Contexte Auth ou Hook personnalisés (`useUser`, `useSession`) dans `@/providers/supabase-provider.tsx`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Nominal** : Vérifier que le middleware intercepte les requêtes non authentifiées et maintient la session active.
