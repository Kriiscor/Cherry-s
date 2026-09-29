# [TICK-023] test(backend): Tests Automatisés & Sécurité pour les Nouvelles Features

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant que lead dev et expert sécurité, je souhaite étendre la suite de tests automatisés Backend (Vitest) et la validation Zod aux nouveaux endpoints du Sport, du Poids et de l'Hydratation.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Tests d'intégration Vitest pour `/api/sports/*`, `/api/weight/*` et `/api/hydration/*`.
- [ ] Validation des limites de payload (ex: rejet d'une valeur de poids aberrante comme 1 000 kg).
- [ ] Isolation stricte RLS vérifiée dans les tests.

## 3. 🛠️ Spécifications Techniques par Périmètre

### ⚙️ Périmètre Backend & Testing
- Fichiers de test : `tests/backend/sports.test.ts`, `tests/backend/weight.test.ts`, `tests/backend/hydration.test.ts`.

## 4. 🧪 Scénarios de Validation
- Exécution de `pnpm test:backend` $\rightarrow$ 100% de succès sur la totalité des 23 tickets.
