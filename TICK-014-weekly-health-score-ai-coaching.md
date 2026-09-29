# [TICK-014] feat(analytics): Carte Score de Santé & Rapport de Coaching IA

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite voir ma note hebdomadaire de qualité nutritionnelle (/100) ainsi que mes conseils personnalisés rédigés par l'IA.
- **Règles de gestion** :
  - Score coloré (Vert ≥ 80, Orange 60-79, Rouge < 60).
  - Bouton "Régénérer le bilan" si de nouveaux repas ont été ajoutés sur la semaine.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Carte de score `shadcn/ui` épurée avec icône `Sparkles`.
- [ ] Affichage dynamique du contenu Markdown d'astuces généré par l'IA Replicate.
- [ ] Skeleton de chargement pendant la génération du bilan IA.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Lecture depuis `weekly_reports`.

### ⚙️ Périmètre Backend & API (Agent Backend)
- Appel de la route proxy `/api/ai/weekly-summary`.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/analytics/components/WeeklyReportCard.tsx`
- **Composants `shadcn/ui`** : `Card`, `Badge`, `Accordion`, `Skeleton`, `Sparkles`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Generation** : Cliquer sur "Générer mon bilan" $\rightarrow$ Affiche le skeleton pendant 3s, puis révèle le score et le rapport d'analyse.
