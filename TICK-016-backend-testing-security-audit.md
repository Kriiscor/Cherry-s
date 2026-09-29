# [TICK-016] test(backend): Suite de Tests Automatisés Backend et Audit de Sécurité OWASP

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant que lead dev et responsable sécurité, je souhaite disposer d'une suite de tests automatisés (unitaires et d'intégration) pour le backend ainsi que d'un audit de sécurité automatisé afin de garantir la qualité, l'absence de régression et la conformité aux normes OWASP Top 10.
- **Règles de gestion** :
  - Couverture de code backend minimale : **≥ 80%**.
  - Zéro secret ou clé API exposé dans les fichiers sources ou commits.
  - Zéro vulnérabilité critique ou haute relevée par `npm audit`.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Framework de test **Vitest** ou **Jest** configuré pour les routes d'API et les Server Actions.
- [ ] Mocking des appels API externes (Replicate API & Supabase) via **MSW (Mock Service Worker)** pour exécuter les tests hors-ligne rapidement.
- [ ] En-têtes HTTP de sécurité configurés via Helmet / Next.js config (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`).
- [ ] Protection contre les attaques par force brute et Déni de Service (Rate Limiting via `@upstash/ratelimit` / Redis sur toutes les routes publiques et d'IA).
- [ ] Script d'audit de sécurité automatisé (`npm audit --audit-level=high`) intégré dans le pipeline CI.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD & Sécurité)
- **Vérification RLS** : Tests automatisés vérifiant que les requêtes sans jeton d'authentification valide ou avec un jeton d'un autre utilisateur retournent une erreur `403 Forbidden` ou 0 ligne.
- **Sanitisation** : S'assurer qu'aucune concaténation de chaînes SQL brutes n'est utilisée (utilisation exclusive de l'ORM/Query Builder Supabase paramétré).

### ⚙️ Périmètre Backend & API (Agent Backend & Testing)
- **Structure des tests** : `tests/backend/ai-meal-api.test.ts`, `tests/backend/auth.test.ts`, `tests/backend/rls.test.ts`.
- **Mocking MSW** : Interception des requêtes HTTP sortantes vers `https://api.replicate.com/v1/predictions` pour simuler :
  - Succès (200 OK avec payload JSON valide).
  - Échec quota / Rate limit Replicate (429 Too Many Requests).
  - Erreur interne Replicate (500 Internal Error).
- **Protection Rate Limiting** :
  - Limite sur `/api/ai/analyze-meal` : Maximum **10 requêtes / minute / IP**.
  - Limite sur `/api/ai/weekly-summary` : Maximum **3 requêtes / heure / utilisateur**.
- **Sanitisation des sorties** : Filtrage et échappement des réponses Markdown et HTML pour parer toute faille XSS (Stored XSS / Reflected XSS).

### 🎨 Périmètre Frontend (Agent Frontend)
- Gestion et affichage propre des codes d'erreur backend de sécurité (`429 Too Many Requests`, `413 Payload Too Large`, `401 Unauthorized`).

## 4. 🧪 Scénarios de Validation & Tests Backend
- **Test Rate Limiting** : Exécuter 11 requêtes consécutives sur `/api/ai/analyze-meal` en moins d'une minute $\rightarrow$ La 11ème requête retourne `429 Too Many Requests` avec en-tête `Retry-After`.
- **Test Protection Secret** : Vérifier par script automatisé qu'aucune variable du type `REPLICATE_API_TOKEN` ou `SUPABASE_SERVICE_ROLE_KEY` ne contient le préfixe `NEXT_PUBLIC_`.
- **Test Invalidation XSS** : Injecter `<script>alert('xss')</script>` dans le nom d'un aliment $\rightarrow$ L'API nettoie et neutralise la balise avant enregistrement.
- **Checklist Qualité** : Lancement de `npm run test:backend` $\rightarrow$ 100% des tests réussis.
