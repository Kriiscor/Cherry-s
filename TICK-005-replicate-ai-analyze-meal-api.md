# [TICK-005] backend(ai): Endpoint Proxy Replicate AI pour l'Analyse Vision de Repas

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite envoyer une photo ou un texte décrivant mon repas pour recevoir immédiatement une estimation calorique et macro-nutritionnelle détaillée.
- **Règles de gestion & Sécurité** :
  - Sécuriser la clé API Replicate (`REPLICATE_API_TOKEN`) strictement côté serveur.
  - **Sécurité OWASP** : Limitation de débit (Rate Limiting : max 10 requêtes/min/IP) pour éviter les abus et le déni de service de quota.
  - **Limitation Payload** : Taille maximale de l'image autorisée = **5 Mo**.
  - **Validation MIME** : Formats acceptés uniquement `image/jpeg`, `image/png`, `image/webp`.
  - Valider la réponse structurée JSON à l'aide d'un schéma `Zod`.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Endpoint `POST /api/ai/analyze-meal` fonctionnel avec validation Zod stricte.
- [ ] Middleware de Rate Limiting actif (Retourne `429 Too Many Requests` si dépassé).
- [ ] Rejet explicite des fichiers non-images ou des images > 5 Mo (`413 Payload Too Large`).
- [ ] Suite de **tests d'intégration backend (Vitest + MSW)** simulant les retours Replicate.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Aucun enregistrement direct (l'enregistrement est géré lors de la validation par l'utilisateur).

### ⚙️ Périmètre Backend & API (Agent Backend & Security)
- **Route** : `POST /api/ai/analyze-meal`
- **Validation Zod (`src/lib/validators/aiMealSchema.ts`)** :
  ```typescript
  export const aiMealRequestSchema = z.object({
    imageUrl: z.string().url().optional(),
    textDescription: z.string().max(500, "Description trop longue").optional(),
  }).refine(data => data.imageUrl || data.textDescription, {
    message: "Fournir au moins une photo ou une description texte"
  });
  ```
- **Sécurité & Rate Limit** : Implémentation via `@upstash/ratelimit` (10 req/min/IP). En développement local sans `UPSTASH_REDIS_REST_URL`/`TOKEN` renseignés (cf. `USER_CHECKLIST.md`, étape optionnelle), le middleware doit passer en mode "no-op" (laisser passer les requêtes sans erreur) plutôt que de faire planter la route.
- **Intégration Replicate** : Appel au modèle vision (`meta/llama-3.2-11b-vision-instruct`).
- **Codes HTTP** : `200 OK`, `400 Bad Request`, `413 Payload Too Large`, `429 Too Many Requests`, `500 Internal Error`.

### 🎨 Périmètre Frontend (Agent Frontend)
- Hook d'appel TanStack Query (`useAnalyzeMealMutation`) avec gestion des erreurs 429 et 413 via Toasts `Sonner`.

## 4. 🧪 Scénarios de Validation & Tests Backend
- **Test d'Intégration (Vitest + MSW)** :
  1. *Test Nominal* : Mock MSW retourne une réponse JSON d'aliment $\rightarrow$ `200 OK` avec données structurées.
  2. *Test Rate Limit* : Exécuter 11 requêtes d'affilée $\rightarrow$ Reçoit HTTP `429`.
  3. *Test Security Payload* : Envoyer un fichier texte déguisé en image de 10 Mo $\rightarrow$ Reçoit HTTP `413` ou `400`.
  4. *Test Secret Non-Exposé* : Vérifier que le header de réponse ou le corps ne contient jamais la clé Replicate.
