# 🧰 Inventaire et Cartographie des Skills Réutilisables

Ce document répertorie l'ensemble des **skills** nécessaires pour orchestrer le développement de **NutriVision AI / App Cherry**, répartis entre les skills internes du système et les skills communautaires GitHub.

---

## 📌 1. Skills Internes Répertoriés & Dupliqués dans ce Dossier

Les skills suivants sont copiés et adaptés directement dans le dossier `skills/` pour permettre une exécution autonome :

| Skill | Nom | Utilité pour le projet NutriVision AI | Fichier dans ce dossier |
| :--- | :--- | :--- | :--- |
| 📝 **Ticket Creator** | `ticket-creator` | Génère et formalise les tickets techniques selon l'architecture du projet. | [`ticket-creator.md`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/skills/ticket-creator.md) |
| 📊 **Ticket Analyst** | `ticket-analyst` | Découpe un ticket complexe en contrats d'interface (Frontend vs Backend). | [`ticket-analyst.md`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/skills/ticket-analyst.md) |
| 🎨 **Frontend Dev** | `frontend-dev` | Implémente le code Next.js, `shadcn/ui`, Tailwind et React Hook Form. | [`frontend-dev.md`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/skills/frontend-dev.md) |
| ⚙️ **Backend Dev** | `backend-dev` | Implémente les routes d'API Next.js, Supabase RLS et Replicate Vision API. | [`backend-dev.md`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/skills/backend-dev.md) |
| 🛡️ **Auditing Security** | `auditing-security` | Audite la sécurité OWASP (Rate Limiting, sanitisation XSS, RLS, fuite de clés). | [`auditing-security.md`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/skills/auditing-security.md) |
| 🌐 **Modern Web Guidance** | `modern-web-guidance` | Garantit le respect des dernières normes web (PWA, responsive layout). | [`modern-web-guidance.md`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/skills/modern-web-guidance.md) |
| 📑 **ADR Management** | `architecture-decision-records` | Maintient les fichiers d'architecture (ADR) à jour. | [`architecture-decision-records.md`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/skills/architecture-decision-records.md) |
| 🔍 **Verifying in Browser** | `verifying-in-browser` | Valide le rendu visuel et les formulaires dans le navigateur. | [`verifying-in-browser.md`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/skills/verifying-in-browser.md) |

---

## 🌐 2. Skills Communautaires Recommandés (GitHub / External)

Les skills suivants sont recommandés pour enrichir l'agent lors du développement de fonctionnalités avancées :

### 🔹 1. `supabase-expert` (GitHub)
- **Source** : [GitHub - Supabase Community Skills](https://github.com/supabase/agent-skills)
- **Rôle** : Fournit les meilleures pratiques pour rédiger des politiques RLS complexes, des triggers SQL et des Edge Functions Supabase.

### 🔹 2. `shadcn-ui-builder` (GitHub)
- **Source** : [GitHub - shadcn UI Community Agents](https://github.com/shadcn/ui-skills)
- **Rôle** : Recommande les meilleures compositions de composants Radix UI / Tailwind CSS pour des interfaces mobile-first réactives.

### 🔹 3. `replicate-ai-vision` (Community)
- **Source** : [GitHub - Replicate JS SDK Guides](https://github.com/replicate/replicate-javascript)
- **Rôle** : Optimise la gestion du streaming et des timeouts lors des prédictions de modèles Llama 3.2 Vision et LLaVA.

### 🔹 4. `playwright-e2e` (GitHub)
- **Source** : [GitHub - Playwright Community Skills](https://github.com/microsoft/playwright-skills)
- **Rôle** : Automatise les scénarios de test bout en bout (prise de photo, inscription, affichage du bilan).
