---
name: auditing-security
description: Audit de sécurité OWASP, Rate Limiting, Sanitisation Anti-XSS et vérification des fuites de clés.
---

# 🛡️ Skill : Auditing Security (NutriVision AI)

## Directives Sécurité
1. **Zero Secret Leak** : Vérifier que la clé `REPLICATE_API_TOKEN` et `SUPABASE_SERVICE_ROLE_KEY` ne fuient pas côté client.
2. **Rate Limiting** : Enforcer une limite de débit sur les routes sensibles (`@upstash/ratelimit`).
3. **Anti-XSS** : Purifier tout contenu Markdown retourné par l'IA avec `isomorphic-dompurify`.
4. **Vérification RLS** : Tester que l'isolation inter-utilisateurs est hermétique au niveau PostgreSQL.
