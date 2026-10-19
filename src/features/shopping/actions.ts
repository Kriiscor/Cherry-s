"use server";

import { createClient } from "@/lib/supabase/server";
import type { GroceryItem } from "@/lib/validators/recipeGroceriesSchema";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getOrCreateActiveListAction(): Promise<
  ActionResult<{ id: string; name: string }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: existing } = await supabase
    .from("shopping_lists")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) return { success: true, data: existing };

  const { data: created, error } = await supabase
    .from("shopping_lists")
    .insert({ user_id: user.id })
    .select("id, name")
    .single();

  if (error || !created) return { success: false, error: "Impossible de créer la liste" };
  return { success: true, data: created };
}

export async function getShoppingItemsAction(listId: string): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      quantity: number | null;
      unit: string | null;
      aisle: string;
      is_pantry_staple: boolean;
      is_checked: boolean;
    }>
  >
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("shopping_items")
    .select("id, name, quantity, unit, aisle, is_pantry_staple, is_checked")
    .eq("list_id", listId)
    .eq("user_id", user.id)
    .order("aisle")
    .order("name");

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function toggleShoppingItemAction(
  itemId: string,
  isChecked: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("shopping_items")
    .update({ is_checked: isChecked })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function addShoppingItemAction(
  listId: string,
  name: string
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Nom requis" };

  const { data, error } = await supabase
    .from("shopping_items")
    .insert({
      list_id: listId,
      user_id: user.id,
      name: trimmed,
      aisle: "Épicerie Salée",
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: error?.message ?? "Erreur" };
  return { success: true, data };
}

export async function clearCheckedItemsAction(listId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("list_id", listId)
    .eq("user_id", user.id)
    .eq("is_checked", true);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function saveGroceryItemsAction(
  listId: string,
  items: GroceryItem[]
): Promise<ActionResult<{ count: number }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const rows = items.map((item) => ({
    list_id: listId,
    user_id: user.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    aisle: item.aisle,
    is_pantry_staple: item.is_pantry_staple,
  }));

  const { error } = await supabase.from("shopping_items").insert(rows);
  if (error) return { success: false, error: error.message };
  return { success: true, data: { count: rows.length } };
}
