# [TICK-002] setup(ui): Intégration de shadcn/ui et du Design System NutriVision

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite bénéficier d'une interface utilisateur moderne, accessible, réactive et élégante en mode clair/sombre grâce à la bibliothèque `shadcn/ui`.
- **Règles de gestion** :
  - Palette de couleurs "Cerise" (design system officiel, cf. `DESIGN_SYSTEM.md` et `prototypes/figma_design_system.html`) : Rouge Cerise `#E63946` en couleur primaire (actions, boutons, éléments de marque), Bordeaux `#590D22` pour les titres et le thème sombre, Vert Émeraude `#10B981` conservé en couleur secondaire pour les indicateurs santé/succès/protéines. Échelle de teintes Tailwind complète (50-950) pour chaque couleur.
  - Police `Plus Jakarta Sans`.
  - Coins fortement arrondis : `rounded-xl`/`rounded-2xl` comme convention par défaut pour les composants (boutons, cards, inputs).
  - Mode sombre (`dark`) supporté avec `next-themes`.
  - Icônes standardisées via `lucide-react`.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Initialisation de `shadcn/ui` avec `npx shadcn@latest init`.
- [ ] Composants installés et testés : `Button`, `Card`, `Input`, `Label`, `Dialog`, `Drawer`, `Badge`, `Progress`, `Skeleton`, `Sonner`, `DropdownMenu`, `Tabs`, `Table`.
- [ ] Swapper de thème (Clair / Sombre / Système) fonctionnel sans saut de rendu (FOUC).

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Stockage de la préférence de thème utilisateur si connecté (optionnel, fallback sur `localStorage`).

### ⚙️ Périmètre Backend & API (Agent Backend)
- Aucun impact backend.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `@/components/ui/*`, `@/components/theme-provider.tsx`
- **Composants** : Découpage strict (< 100 lignes par composant personnalisé wrappers).
- **Icons** : Import sélectif depuis `lucide-react` (ex: `Utensils`, `Flame`, `Dumbbell`, `Sparkles`, `Camera`).

## 4. 🧪 Scénarios de Validation & Tests
- **Test Nominal** : Vérifier que chaque composant `shadcn/ui` s'affiche correctement en mode clair et en mode sombre.
- **Checklist Qualité** : Contraste de couleurs accessible (norme WCAG AA).
