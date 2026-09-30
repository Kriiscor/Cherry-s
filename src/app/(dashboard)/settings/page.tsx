import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { SignOutButton } from "@/features/settings/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SettingsInput } from "@/lib/validators/settingsSchema";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // The proxy (src/proxy.ts) guards this route group and redirects
    // unauthenticated visitors to /login before this ever renders.
    return null;
  }

  const [{ data: profile }, { data: goals }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("user_goals")
      .select(
        "weight_kg, height_cm, age, sex, activity_level, goal_type, daily_calories, protein_grams, carbs_grams, fat_grams, daily_steps_goal, daily_water_ml"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const defaultValues: SettingsInput = {
    fullName: profile?.full_name ?? "",
    weightKg: goals?.weight_kg ?? 70,
    heightCm: goals?.height_cm ?? 175,
    age: goals?.age ?? 30,
    sex: goals?.sex ?? "male",
    activityLevel: goals?.activity_level ?? "moderate",
    goalType: goals?.goal_type ?? "maintain",
    dailyCalories: goals?.daily_calories ?? 2000,
    proteinGrams: goals?.protein_grams ?? 150,
    carbsGrams: goals?.carbs_grams ?? 200,
    fatGrams: goals?.fat_grams ?? 65,
    dailyStepsGoal: goals?.daily_steps_goal ?? 10000,
    dailyWaterMl: goals?.daily_water_ml ?? 2500,
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 py-8">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-cherry-900">Paramètres</h1>
        <p className="mt-1 text-sm text-cherry-900/70">
          Gérez votre profil et vos objectifs nutritionnels.
        </p>
      </div>

      <SettingsForm defaultValues={defaultValues} />

      <div className="flex w-full max-w-lg items-center justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Apparence</p>
          <p className="text-sm text-muted-foreground">
            Choisissez le thème clair, sombre, ou suivez celui de votre appareil.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg">
        <SignOutButton />
      </div>
    </div>
  );
}
