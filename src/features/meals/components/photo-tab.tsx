"use client";

import { useRef, type ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Same limits as the /api/ai/analyze-meal endpoint (TICK-005/TICK-009). */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type PhotoTabProps = {
  preview: string | null;
  onFileSelected: (file: File | null) => void;
  disabled?: boolean;
};

/**
 * Photo capture/import tab (TICK-009). Accepts a camera capture or a
 * gallery pick, validates size/MIME client-side, and shows an instant
 * preview of the selected image.
 */
export function PhotoTab({ preview, onFileSelected, disabled }: PhotoTabProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      onFileSelected(null);
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Image trop volumineuse (5 Mo maximum).");
      event.target.value = "";
      onFileSelected(null);
      return;
    }
    if (!ALLOWED_PHOTO_MIME_TYPES.has(file.type)) {
      toast.error("Format non supporté (jpeg, png ou webp uniquement).");
      event.target.value = "";
      onFileSelected(null);
      return;
    }
    onFileSelected(file);
  };

  const handleRemove = () => {
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {preview ? (
        <div className="relative w-full overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob preview URL, next/image would need `unoptimized` anyway */}
          <img
            src={preview}
            alt="Aperçu du repas"
            className="h-48 w-full object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X />
            <span className="sr-only">Retirer la photo</span>
          </Button>
        </div>
      ) : (
        <label
          htmlFor="meal-photo-input"
          className="flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/30 text-center text-muted-foreground transition-colors hover:bg-muted/50"
        >
          <ImagePlus className="size-8" />
          <span className="text-sm">
            Prendre une photo ou choisir dans la galerie
          </span>
          <span className="text-xs">JPEG, PNG ou WEBP — 5 Mo max</span>
        </label>
      )}
      <input
        ref={inputRef}
        id="meal-photo-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
