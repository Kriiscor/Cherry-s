"use client";

import { useRef, type ChangeEvent } from "react";
import { Camera, ImagePlus, Images, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Same limits as the /api/ai/analyze-meal endpoint (TICK-005/TICK-009). */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ACCEPT = "image/jpeg,image/png,image/webp";

type PhotoTabProps = {
  preview: string | null;
  onFileSelected: (file: File | null) => void;
  disabled?: boolean;
};

/**
 * Photo capture/import tab (TICK-009). Two entry points on mobile:
 *  - "Appareil photo" → `capture="environment"` opens the camera directly.
 *  - "Galerie" → no capture attribute, opens the system file/photo picker.
 * On desktop both show the standard file dialog (capture is ignored).
 */
export function PhotoTab({ preview, onFileSelected, disabled }: PhotoTabProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const validate = (
    file: File,
    event: ChangeEvent<HTMLInputElement>
  ): boolean => {
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Image trop volumineuse (5 Mo maximum).");
      event.target.value = "";
      return false;
    }
    if (!ALLOWED_PHOTO_MIME_TYPES.has(file.type)) {
      toast.error("Format non supporté (jpeg, png ou webp uniquement).");
      event.target.value = "";
      return false;
    }
    return true;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) { onFileSelected(null); return; }
    if (validate(file, event)) onFileSelected(file);
    else onFileSelected(null);
  };

  const handleRemove = () => {
    onFileSelected(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {preview ? (
        <div className="relative w-full overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob preview URL */}
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
        <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-dashed border-input bg-muted/30 px-4 py-6">
          <ImagePlus className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Choisis comment ajouter ta photo
          </p>
          <div className="flex w-full gap-2">
            {/* Camera — opens camera directly on mobile */}
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              disabled={disabled}
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="size-4" />
              Appareil photo
            </Button>
            {/* Gallery — opens photo library / file picker */}
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              disabled={disabled}
              onClick={() => galleryInputRef.current?.click()}
            >
              <Images className="size-4" />
              Galerie
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG ou WEBP — 5 Mo max
          </p>
        </div>
      )}

      {/* Hidden input — camera only (capture forces camera on mobile) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept={ACCEPT}
        capture="environment"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      {/* Hidden input — gallery / file picker (no capture attribute) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
