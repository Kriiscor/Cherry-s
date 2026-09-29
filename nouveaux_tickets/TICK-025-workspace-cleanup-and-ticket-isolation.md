# [TICK-025] devops(workspace): Nettoyage du Dossier Principal et Isolation du Cahier des Charges

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant que développeur, je souhaite nettoyer le dossier de code du projet afin qu'il ne contienne strictement que le code source nécessaire, les configurations et `CLAUDE.md`, tout en conservant le cahier des charges et la liste complète des tickets isolés dans le dossier externe sur le Bureau.
- **Règles de gestion** :
  - Séparation stricte entre le dossier de développement du code (`c:\Users\dubail\Documents\antigravity\hopeful-noether`) et le dossier de spécification (`C:\Users\dubail\OneDrive - JCDECAUX\Bureau\Tickets App Cherry\`).
  - Suppression de tout fichier temporaire, scratch ou artefact non nécessaire dans le workspace de code.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Dossier de code principal épuré et exempt de fichiers de travail temporaires.
- [ ] Dossier `Tickets App Cherry` sur le Bureau contenant l'ensemble des 25 tickets, prototypes HTML, agents, skills et checklists.
- [ ] Le fichier `CLAUDE.md` est présent à la racine du workspace de code pour guider les agents lors du build.

## 3. 🛠️ Spécifications Techniques par Périmètre

### ⚙️ Périmètre DevOps & Nettoyage
- Vérification du fichier `.gitignore` pour exclure les répertoires temporaires et `.env.local`.
- Structure du workspace de code :
  ```
  hopeful-noether/
  ├── CLAUDE.md
  ├── package.json
  ├── tsconfig.json
  ├── tailwind.config.ts
  └── src/
  ```

## 4. 🧪 Scénarios de Validation
- Exécuter la vérification du workspace local $\rightarrow$ Aucun fichier parasite présent.
