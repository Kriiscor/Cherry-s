# [TICK-009] feat(meal): Interface de Saisie de Repas (Photo / Texte avec Drawer/Dialog)

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite facilement prendre une photo de mon assiette ou décrire mon plat par texte pour lancer l'analyse IA.
- **Règles de gestion** :
  - Mobile First : Ouverture sous forme de `Drawer` en bas de l'écran sur smartphone, et de `Dialog` sur desktop.
  - Saisie possible par : Caméra en direct, Import photo depuis la galerie, ou Champ texte descriptif.
  - Sélection obligatoire du type de repas (Petit-déjeuner, Déjeuner, Dîner, Collation).

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Interface responsive avec bascule d'onglets (Photo vs Texte).
- [ ] Prévisualisation instantanée de la photo sélectionnée.
- [ ] Bouton "Analyser mon repas" avec indicateur d'attente (Spinner / Skeleton).

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD)
- Téléversement temporaire de la photo sur Supabase Storage (`meal-photos`).

### ⚙️ Périmètre Backend & API (Agent Backend)
- API route d'upload Supabase Storage.
- **Validation de l'upload** : Taille maximale = **5 Mo**, formats MIME acceptés uniquement `image/jpeg`, `image/png`, `image/webp` (mêmes limites que l'endpoint `analyze-meal` du TICK-005, pour rester cohérent).
- **Convention de chemin de stockage** : Photos téléversées sous `meal-photos/{user_id}/{uuid}.{ext}` dans le bucket Supabase Storage, avec une policy RLS Storage restreignant chaque utilisateur à son propre préfixe `{user_id}/` (ce qui sert aussi de vérification d'appartenance).
- **Note (Backlog)** : Le nettoyage des photos temporaires abandonnées en cours de flux (utilisateur fermant le Drawer sans enregistrer) est hors périmètre de ce ticket ; à traiter plus tard via une Supabase Edge Function planifiée ou une règle de cycle de vie du storage.

### 🎨 Périmètre Frontend (Agent Frontend)
- **Emplacement Feature** : `src/features/meals/components/MealInputDrawer.tsx`
- **Composants `shadcn/ui`** : `Drawer`, `Dialog`, `Tabs`, `Button`, `Textarea`, `Badge`.

## 4. 🧪 Scénarios de Validation & Tests
- **Test Mobile** : Cliquer sur le bouton "+" $\rightarrow$ Le Drawer remonte depuis le bas de l'écran avec les options appareil photo / galerie / texte.
