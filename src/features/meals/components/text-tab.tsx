"use client";

import { Textarea } from "@/components/ui/textarea";

const MAX_LENGTH = 500;

type TextTabProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

/** Free-text meal description tab (TICK-009). */
export function TextTab({ value, onChange, disabled }: TextTabProps) {
  return (
    <div className="flex flex-col gap-2 py-2">
      <Textarea
        placeholder="Ex : Une assiette de pâtes bolognaise avec un verre de vin rouge..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        maxLength={MAX_LENGTH}
        className="min-h-32"
      />
      <p className="text-right text-xs text-muted-foreground">
        {value.length}/{MAX_LENGTH}
      </p>
    </div>
  );
}
