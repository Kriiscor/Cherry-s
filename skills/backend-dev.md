---
name: backend-dev
description: Guide d'implémentation backend API routes Next.js, Supabase RLS et Replicate API.
---

# ⚙️ Skill : Backend Dev (NutriVision AI)

## Directives Backend
1. **Validation Stricte** : Valider 100% des entrées HTTP via des schémas `Zod`.
2. **Sécurité des Secrets** : Ne jamais stocker de clé API en clair (`REPLICATE_API_TOKEN` uniquement via `process.env`).
3. **Supabase RLS** : S'assurer que chaque requête vérifie l'identité `auth.uid() = user_id`.
4. **Tests Backend** : Écrire des tests unitaires et d'intégration avec **Vitest** et **MSW** pour mocker les API tierces.
