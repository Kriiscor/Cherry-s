"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, CalendarDays } from "lucide-react";
import { ShoppingListView } from "@/features/shopping/components/ShoppingListView";
import { WeeklyMealPlanner } from "@/features/planner/components/WeeklyMealPlanner";

export default function CoursesPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-28">
      <Tabs defaultValue="liste">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="liste" className="flex-1 gap-2">
            <ShoppingCart className="h-4 w-4" />
            Liste de courses
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex-1 gap-2">
            <CalendarDays className="h-4 w-4" />
            Planning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liste">
          <ShoppingListView />
        </TabsContent>

        <TabsContent value="planning">
          <WeeklyMealPlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
}
