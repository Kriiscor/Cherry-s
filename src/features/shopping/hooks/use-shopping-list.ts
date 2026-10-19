"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrCreateActiveListAction,
  getShoppingItemsAction,
  toggleShoppingItemAction,
  addShoppingItemAction,
  clearCheckedItemsAction,
} from "../actions";

export function useShoppingList() {
  const listQuery = useQuery({
    queryKey: ["shopping-list"],
    queryFn: async () => {
      const result = await getOrCreateActiveListAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const itemsQuery = useQuery({
    queryKey: ["shopping-items", listQuery.data?.id],
    queryFn: async () => {
      const result = await getShoppingItemsAction(listQuery.data!.id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!listQuery.data?.id,
  });

  return { listQuery, itemsQuery };
}

export function useToggleShoppingItem(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, isChecked }: { itemId: string; isChecked: boolean }) =>
      toggleShoppingItemAction(itemId, isChecked),
    onMutate: async ({ itemId, isChecked }) => {
      await queryClient.cancelQueries({ queryKey: ["shopping-items", listId] });
      const previous = queryClient.getQueryData<
        Array<{ id: string; is_checked: boolean }>
      >(["shopping-items", listId]);

      queryClient.setQueryData<Array<{ id: string; is_checked: boolean }>>(
        ["shopping-items", listId],
        (old) => old?.map((item) => (item.id === itemId ? { ...item, is_checked: isChecked } : item))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["shopping-items", listId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-items", listId] });
    },
  });
}

export function useAddShoppingItem(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => addShoppingItemAction(listId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-items", listId] });
    },
  });
}

export function useClearCheckedItems(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearCheckedItemsAction(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-items", listId] });
    },
  });
}
