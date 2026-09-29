/**
 * Static MET (Metabolic Equivalent of Task) catalogue for the sport module
 * (TICK-018). Values follow the Compendium of Physical Activities. Kept as a
 * plain TS constant — not a DB table nor an API route — since it is reference
 * data shared client + server (mirrors how the project keeps other static
 * option lists like MEAL_TYPE_OPTIONS in feature `types.ts`).
 */
export type MetActivity = {
  /** Stable key used as the <Select> value. */
  slug: string;
  /** Display name persisted to `sports_activities.activity_name`. */
  name: string;
  /** MET coefficient persisted to `sports_activities.met_value`. */
  met: number;
};

export const MET_CATALOG: MetActivity[] = [
  { slug: "running", name: "Course à pied", met: 9.8 },
  { slug: "walking", name: "Marche", met: 3.5 },
  { slug: "cycling", name: "Vélo", met: 7.5 },
  { slug: "swimming", name: "Natation", met: 8.0 },
  { slug: "weightlifting", name: "Musculation", met: 6.0 },
  { slug: "hiit", name: "HIIT", met: 8.0 },
  { slug: "yoga", name: "Yoga", met: 2.5 },
  { slug: "football", name: "Football", met: 7.0 },
  { slug: "basketball", name: "Basketball", met: 6.5 },
  { slug: "tennis", name: "Tennis", met: 7.3 },
  { slug: "boxing", name: "Boxe", met: 9.0 },
  { slug: "dancing", name: "Danse", met: 5.0 },
  { slug: "elliptical", name: "Elliptique", met: 5.5 },
  { slug: "rowing", name: "Rameur", met: 7.0 },
  { slug: "jump_rope", name: "Corde à sauter", met: 11.0 },
];

export function findMetActivity(slug: string): MetActivity | undefined {
  return MET_CATALOG.find((activity) => activity.slug === slug);
}
