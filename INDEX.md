# 🍒 App Cherry - NutriVision AI : Index des Tickets de Développement

Ce dossier contient l'ensemble des 16 tickets techniques structurés pour le développement de l'application mobile & web **NutriVision AI / App Cherry**, intégrant les **tests automatisés backend** et la **sécurité OWASP**.

---

## 📂 Liste des Tickets

### 🏗️ EPIC 1 : Setup & Infrastructure
- 📄 [TICK-001-setup-project.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-001-setup-project.md) - Initialisation Next.js 14+ / TypeScript / Tailwind
- 📄 [TICK-002-shadcn-ui-design-system.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-002-shadcn-ui-design-system.md) - Intégration de `shadcn/ui` et du Design System
- 📄 [TICK-003-supabase-client-setup.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-003-supabase-client-setup.md) - Configuration du Client Supabase (SSR & Auth)

### 🗄️ EPIC 2 : Backend, Sécurité & Base de Données
- 📄 [TICK-004-database-schemas-rls.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-004-database-schemas-rls.md) - Migration Schémas PostgreSQL & RLS Supabase
- 📄 [TICK-005-replicate-ai-analyze-meal-api.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-005-replicate-ai-analyze-meal-api.md) - Endpoint Proxy Replicate AI (avec Rate Limiting & Validation Payload)
- 📄 [TICK-006-replicate-ai-weekly-summary-api.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-006-replicate-ai-weekly-summary-api.md) - Endpoint Bilan Hebdomadaire (avec Purification Anti-XSS)

### 🔐 EPIC 3 : Authentification & Onboarding
- 📄 [TICK-007-auth-login-register.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-007-auth-login-register.md) - Écran d'Authentification (`shadcn/ui`)
- 📄 [TICK-008-onboarding-goals-setup.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-008-onboarding-goals-setup.md) - Assistant de Configuration des Objectifs

### 📸 EPIC 4 : Capture de Repas & IA
- 📄 [TICK-009-meal-capture-input-interface.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-009-meal-capture-input-interface.md) - Interface de Saisie de Repas (Drawer/Dialog)
- 📄 [TICK-010-ai-meal-preview-edit-modal.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-010-ai-meal-preview-edit-modal.md) - Modal de Prévisualisation et Édition IA

### 📊 EPIC 5 : Tableau de Bord Quotidien
- 📄 [TICK-011-daily-nutrition-dashboard-gauges.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-011-daily-nutrition-dashboard-gauges.md) - Jauges de Progression Calories & Macronutriments
- 📄 [TICK-012-daily-meal-timeline.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-012-daily-meal-timeline.md) - Chronologie des Repas de la Journée

### 📈 EPIC 6 : Analytics Hebdomadaires & Coaching IA
- 📄 [TICK-013-weekly-nutrition-trends-chart.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-013-weekly-nutrition-trends-chart.md) - Graphique des Tendances Nutritionnelles sur 7 Jours
- 📄 [TICK-014-weekly-health-score-ai-coaching.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-014-weekly-health-score-ai-coaching.md) - Carte Score de Santé & Rapport de Coaching IA

### ⚙️ EPIC 7 : Profil & Paramètres
- 📄 [TICK-015-user-settings-profile.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-015-user-settings-profile.md) - Gestion du Profil Utilisateur et Préférences

### 🛡️ EPIC 8 : Tests Backend & Audit Sécurité OWASP
- 📄 [TICK-016-backend-testing-security-audit.md](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/TICK-016-backend-testing-security-audit.md) - Suite de Tests Automatisés Backend (Vitest, MSW) & Audit de Sécurité OWASP
