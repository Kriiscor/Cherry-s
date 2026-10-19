"use client";

import { useState, useTransition } from "react";
import { Plus, ShoppingCart, Trash2, PackageOpen } from "lucide-react";
import { toast } from "sonner";

import {
  useShoppingList,
  useToggleShoppingItem,
  useAddShoppingItem,
  useClearCheckedItems,
} from "@/features/shopping/hooks/use-shopping-list";
import { ShoppingItemRow } from "./ShoppingItemRow";
import { RecipeImportModal } from "./RecipeImportModal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AISLE_ORDER = [
  "Fruits & Légumes",
  "Boucherie & Poissonnerie",
  "Frais & Crèmerie",
  "Épicerie Salée",
  "Épicerie Sucrée",
  "Surgelés",
  "Boissons",
  "Entretien & Maison",
];

type Item = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  aisle: string;
  is_pantry_staple: boolean;
  is_checked: boolean;
};

function groupByAisle(items: Item[]): Record<string, Item[]> {
  return items.reduce<Record<string, Item[]>>((acc, item) => {
    (acc[item.aisle] ??= []).push(item);
    return acc;
  }, {});
}

function sortedAisles(groups: Record<string, Item[]>): string[] {
  const known = AISLE_ORDER.filter((a) => a in groups);
  const unknown = Object.keys(groups).filter((a) => !AISLE_ORDER.includes(a));
  return [...known, ...unknown];
}

export function ShoppingListView() {
  const { listQuery, itemsQuery } = useShoppingList();
  const listId = listQuery.data?.id ?? null;

  const toggleMutation = useToggleShoppingItem(listId ?? "");
  const addMutation = useAddShoppingItem(listId ?? "");
  const clearMutation = useClearCheckedItems(listId ?? "");

  const [newItemName, setNewItemName] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [, startTransition] = useTransition();

  const items: Item[] = (itemsQuery.data as Item[] | undefined) ?? [];
  const activeItems = items.filter((i) => !i.is_checked && !i.is_pantry_staple);
  const pantryItems = items.filter((i) => i.is_pantry_staple && !i.is_checked);
  const checkedItems = items.filter((i) => i.is_checked);

  const activeGroups = groupByAisle(activeItems);
  const activeSorted = sortedAisles(activeGroups);

  function handleToggle(itemId: string, isChecked: boolean) {
    toggleMutation.mutate({ itemId, isChecked });
  }

  function handleAdd() {
    const name = newItemName.trim();
    if (!name || !listId) return;
    startTransition(() => {
      addMutation.mutate(name, {
        onSuccess: () => setNewItemName(""),
        onError: () => toast.error("Impossible d'ajouter l'article."),
      });
    });
  }

  function handleClear() {
    if (!listId) return;
    clearMutation.mutate(undefined, {
      onError: () => toast.error("Impossible de vider les articles achetés."),
    });
  }

  if (listQuery.isLoading || itemsQuery.isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </div>
    );
  }

  if (listQuery.isError) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Impossible de charger la liste.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-5 text-primary" />
          <h2 className="font-semibold text-lg">{listQuery.data?.name ?? "Mes Courses"}</h2>
          {items.length > 0 && (
            <Badge variant="secondary">{items.length}</Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImportOpen(true)}
        >
          Importer recettes
        </Button>
      </div>

      {/* Quick add */}
      <div className="flex gap-2">
        <Input
          placeholder="Ajouter un article…"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1"
          disabled={!listId || addMutation.isPending}
        />
        <Button
          size="icon"
          onClick={handleAdd}
          disabled={!newItemName.trim() || !listId || addMutation.isPending}
          aria-label="Ajouter"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Active items by aisle */}
      {activeItems.length === 0 && checkedItems.length === 0 && pantryItems.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <PackageOpen className="size-10" />
          <p className="text-sm">Votre liste est vide. Ajoutez des articles ou importez des recettes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeSorted.map((aisle) => (
            <div key={aisle}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-1">
                {aisle}
              </p>
              {(activeGroups[aisle] ?? []).map((item) => (
                <ShoppingItemRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  disabled={toggleMutation.isPending}
                />
              ))}
            </div>
          ))}

          {/* Pantry / "Déjà chez moi" accordion */}
          {pantryItems.length > 0 && (
            <Accordion type="single" collapsible>
              <AccordionItem
                value="pantry"
                className="border border-amber-200 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/30 overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <span className="font-medium text-sm">Déjà chez moi</span>
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-none text-xs">
                      {pantryItems.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  {pantryItems.map((item) => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      onToggle={handleToggle}
                      disabled={toggleMutation.isPending}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Checked / "Dans le chariot" */}
          {checkedItems.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-4 py-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Articles achetés ({checkedItems.length})
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={clearMutation.isPending}
                  className="text-destructive hover:text-destructive h-7 px-2 text-xs gap-1"
                >
                  <Trash2 className="size-3" />
                  Vider
                </Button>
              </div>
              {checkedItems.map((item) => (
                <ShoppingItemRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  disabled={toggleMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {listId && (
        <RecipeImportModal
          open={importOpen}
          onOpenChange={setImportOpen}
          listId={listId}
        />
      )}
    </div>
  );
}
