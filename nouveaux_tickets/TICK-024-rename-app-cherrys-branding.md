# [TICK-024] feat(branding): Renommage de l'Application en "Cherry's" & Intégration du Logo Cerise

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite retrouver le nom officiel de l'application **Cherry's** ainsi que son logo cerise dans la barre de navigation, les métadonnées de l'application et l'écran de démarrage (PWA / Splash Screen).
- **Règles de gestion** :
  - Remplacement de tout texte "NutriVision" / "App Cherry" par le nom officiel **Cherry's**.
  - Intégration du composant SVG / Icône du logo Cerise officiel.
  - Mise à jour des balises `<title>`, Open Graph metadata et du fichier `manifest.json` (PWA).

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Nom de l'application uniformisé en **Cherry's** sur l'ensemble des pages, composants et e-mails.
- [ ] Composant Logo Cerise réutilisable (`@/components/ui/CherryLogo.tsx`) avec support des tailles (sm, md, lg).
- [ ] Favicon, Apple Touch Icon et Splash Screen mis à jour avec le logo cerise.
- [ ] Titre HTML : `<title>Cherry's - Suivi Nutritionnel & Sport Intelligent</title>`.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Aucun impact BDD.

### ⚙️ Périmètre Backend & API (Agent Backend & Security)
- Mise à jour des modèles d'e-mails d'authentification Supabase (Sujet : "Bienvenue sur Cherry's").

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/components/ui/CherryLogo.tsx`, `src/app/layout.tsx`, `public/manifest.json`.
- **Composants `shadcn/ui`** : Header, Sidebar, Navigation Bar.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Visuel** : Vérifier que le titre de la barre de navigation affiche "Cherry's" avec l'icône cerise sur écran mobile et desktop.
