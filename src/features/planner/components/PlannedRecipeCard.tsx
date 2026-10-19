"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Flame, Dumbbell, Wheat, Droplets, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCookPlannedRecipe } from "../hooks/use-planned-recipes";

interface PlannedRecipeCardProps {
  recipe: {
    id: string;
    title: string;
    servings: number;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    is_cooked: boolean;
    planned_date: string | null;
  };
}

export function PlannedRecipeCard({ recipe }: PlannedRecipeCardProps) {
  const cookMutation = useCookPlannedRecipe();

  const handleCook = () => {
    cookMutation.mutate(recipe.id);
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        recipe.is_cooked && "opacity-60"
      )}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-semibold text-base leading-tight",
                recipe.is_cooked && "line-through text-muted-foreground"
              )}
            >
              {recipe.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {recipe.servings} portion{recipe.servings > 1 ? "s" : ""}
            </p>
          </div>
          {recipe.is_cooked && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shrink-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Cuisiné
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        {/* Macros */}
        {recipe.calories != null && (
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              {recipe.calories} kcal
            </Badge>
            {recipe.protein != null && (
              <Badge variant="outline" className="text-xs gap-1">
                <Dumbbell className="h-3 w-3 text-blue-500" />
                {recipe.protein}g prot.
              </Badge>
            )}
            {recipe.carbs != null && (
              <Badge variant="outline" className="text-xs gap-1">
                <Wheat className="h-3 w-3 text-yellow-500" />
                {recipe.carbs}g gluc.
              </Badge>
            )}
            {recipe.fat != null && (
              <Badge variant="outline" className="text-xs gap-1">
                <Droplets className="h-3 w-3 text-purple-500" />
                {recipe.fat}g lip.
              </Badge>
            )}
          </div>
        )}

        {/* Cook button */}
        {!recipe.is_cooked && (
          <Button
            className="w-full gap-2"
            variant="default"
            size="sm"
            onClick={handleCook}
            disabled={cookMutation.isPending}
          >
            <UtensilsCrossed className="h-4 w-4" />
            {cookMutation.isPending ? "Enregistrement..." : "J'ai cuisiné ce repas"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
