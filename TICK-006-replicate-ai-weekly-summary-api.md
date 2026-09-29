# [TICK-006] backend(ai): Endpoint de Génération du Bilan Hebdomadaire par IA

## 1. 🎯 Contexte & Objectif Métier
- **User Story** : En tant qu'utilisateur, je souhaite recevoir en fin de semaine un rapport synthétique calculant mon score de régularité et me donnant des conseils ciblés pour améliorer ma nutrition.
- **Règles de gestion & Sécurité** :
  - **Sécurité OWASP / Anti-XSS** : Sanitisation stricte du Markdown généré par l'IA (désactivation des balises `<script>`, `<iframe>`, `javascript:` URI) via `isomorphic-dompurify`.
  - **Authentification Stricte** : La route doit impérativement vérifier le jeton JWT Supabase (`auth.uid()`).
  - **Rate Limiting** : Maximum 3 générations de bilan par heure par utilisateur.

## 2. ✅ Critères d'Acceptation (Definition of Done)
- [ ] Endpoint `POST /api/ai/weekly-summary` sécurisé.
- [ ] Extraction isolée des repas des 7 derniers jours appartenant exclusivement à l'utilisateur connecté.
- [ ] Filtrage XSS du contenu Markdown généré avant sauvegarde dans `weekly_reports`.
- [ ] Suite de tests unitaires backend validant les règles de calcul du score.

## 3. 🛠️ Spécifications Techniques par Périmètre

### 🗄️ Périmètre Base de Données (Agent BDD & Security)
- Relecture sécurisée RLS de la table `meals` et insertion isolée dans `weekly_reports`.

### ⚙️ Périmètre Backend & API (Agent Backend & Security)
- **Route** : `POST /api/ai/weekly-summary`
- **Sécurité** :
  - Échappement/Purification XSS : `DOMPurify.sanitize(aiMarkdownOutput)`.
  - Vérification session Supabase : `const { data: { user } } = await supabase.auth.getUser()`. Si non authentifié $\rightarrow$ `401 Unauthorized`.

### 🧮 Algorithme de Calcul du Score de Qualité (`quality_score`)
- **Tolérance** : un écart ≤ 10% par rapport à la cible du jour (`user_goals`) n'est pas pénalisé.
- **Pour chaque jour `d` de J-7 à J-1** :
  - Si aucun repas logué ce jour $\rightarrow$ `day_score(d) = 0`.
  - Sinon, pour chaque cible `m` ∈ {`calories`, `protein`, `carbs`, `fat`} :
    - `dev(m) = |actual(m) - target(m)| / target(m)`
    - `dev_adj(m) = max(0, dev(m) - 0.10)`
  - `weighted_dev = 0.4×dev_adj(calories) + 0.2×dev_adj(protein) + 0.2×dev_adj(carbs) + 0.2×dev_adj(fat)`
  - `day_score(d) = max(0, 100 - weighted_dev × 100)`
- **Ratio de régularité** : `consistency_ratio = jours_logués / 7`.
- **Score final** : `quality_score = round( (Σ day_score(d) for d in 1..7) / 7 × consistency_ratio )`
  - Les jours non logués comptent `day_score = 0` dans la somme (déjà pénalisant), et `consistency_ratio` applique un malus multiplicatif supplémentaire pour toute semaine incomplète (bonus implicite = 1 si les 7 jours sont logués).
- **Cas "semaine parfaite"** (test existant) : 7 jours logués, `dev(m) = 0` pour toutes les cibles tous les jours $\rightarrow$ `day_score(d) = 100` pour chaque jour, `consistency_ratio = 1` $\rightarrow$ `quality_score = 100`.

### 🎨 Périmètre Frontend (Agent Frontend)
- Affichage sécurisé du Markdown avec `react-markdown` configuré sans `dangerouslySetInnerHTML`.

## 4. 🧪 Scénarios de Validation & Tests Backend
- **Test Unitaire (Vitest)** :
  1. *Test Calcul Score* : Tester la fonction de calcul du score avec des données parfaites (100% des cibles atteintes) $\rightarrow$ Retourne 100/100.
  2. *Test Injection XSS* : Injecter du code malveillant `<img src=x onerror=alert(1)>` dans la sortie Replicate mockée $\rightarrow$ La sortie nettoyée est exempte de script actif.
  3. *Test Isolation* : Un utilisateur A tente de générer le bilan pour un utilisateur B $\rightarrow$ Refus HTTP `403`.
