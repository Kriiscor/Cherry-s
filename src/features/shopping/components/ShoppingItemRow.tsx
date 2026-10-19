"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  is_pantry_staple: boolean;
  is_checked: boolean;
}

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: (itemId: string, isChecked: boolean) => void;
  disabled?: boolean;
}

export function ShoppingItemRow({ item, onToggle, disabled }: ShoppingItemRowProps) {
  const quantityLabel =
    item.quantity != null
      ? `${item.quantity}${item.unit ? " " + item.unit : ""}`
      : null;

  return (
    <label
      htmlFor={`item-${item.id}`}
      className={cn(
        "flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer select-none",
        "border border-transparent transition-all duration-200",
        "active:scale-[0.98] touch-manipulation",
        item.is_checked
          ? "opacity-50"
          : "hover:bg-muted/50 hover:border-border"
      )}
    >
      <Checkbox
        id={`item-${item.id}`}
        checked={item.is_checked}
        onCheckedChange={(checked) => onToggle(item.id, !!checked)}
        disabled={disabled}
        className="h-6 w-6 shrink-0 rounded-md"
      />
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-base font-medium transition-all duration-200",
            item.is_checked && "line-through text-muted-foreground"
          )}
        >
          {item.name}
        </span>
      </div>
      {quantityLabel && (
        <span
          className={cn(
            "text-sm text-muted-foreground shrink-0 font-mono",
            item.is_checked && "line-through"
          )}
        >
          {quantityLabel}
        </span>
      )}
    </label>
  );
}
