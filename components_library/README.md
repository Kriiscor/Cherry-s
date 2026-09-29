# 🍒 Cherry's - Component Library React & Tailwind

Ce dossier regroupe la bibliothèque de **composants React / TSX autonome** extraite de la maquette de l'application **Cherry's**.

Chaque composant fait moins de 100 lignes (respect du principe de responsabilité unique SRP), est typé avec TypeScript, stylisé avec Tailwind CSS et prêt à être réutilisé dans les features de l'application.

---

## 📦 Liste des Composants Rentrés

| Composant | Fichier TSX | Description & Usage |
| :--- | :--- | :--- |
| **CherryLogo** | [`CherryLogo.tsx`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/components_library/CherryLogo.tsx) | Logo officiel cerise réutilisable (tailles `sm`, `md`, `lg`, `xl`). |
| **NetCalorieCard** | [`NetCalorieCard.tsx`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/components_library/NetCalorieCard.tsx) | Carte Bilan Calorique Net (`Mangé - Brûlé = Net`) avec jauge. |
| **HydrationTrackerCard** | [`HydrationTrackerCard.tsx`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/components_library/HydrationTrackerCard.tsx) | Tracker d'Eau quotidien avec jauges et boutons 1-clic (`+250ml`, `+500ml`). |
| **SportActivityList** | [`SportActivityList.tsx`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/components_library/SportActivityList.tsx) | Carte du Module Sport avec liste des séances METs enregistrées. |
| **WeightTrackerCard** | [`WeightTrackerCard.tsx`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/components_library/WeightTrackerCard.tsx) | Carte du Suivi de Poids, graphique de pesée et badge IMC. |
| **MealDetailModalView** | [`MealDetailModalView.tsx`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/components_library/MealDetailModalView.tsx) | Vue détaillée d'un repas avec ingrédients, calories et macros. |
| **WeeklyCoachCard** | [`WeeklyCoachCard.tsx`](file:///C:/Users/dubail/OneDrive%20-%20JCDECAUX/Bureau/Tickets%20App%20Cherry/components_library/WeeklyCoachCard.tsx) | Carte du Score IA /100 et conseils hebdomadaires. |

---

## 🚀 Exemple d'importation dans votre projet

```tsx
import { 
  CherryLogo, 
  NetCalorieCard, 
  HydrationTrackerCard, 
  SportActivityList, 
  WeightTrackerCard 
} from "@/components/cherrys";
```
