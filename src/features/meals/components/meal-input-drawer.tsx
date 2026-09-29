"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { useAnalyzeMealMutation } from "@/features/meals/hooks/use-analyze-meal-mutation";
import { normalizeMealImage } from "@/features/meals/lib/image-utils";
import type { MealItem } from "@/lib/validators/aiMealSchema";
import { MEAL_TYPE_OPTIONS, type MealType } from "@/features/meals/types";
import { MealEditModal } from "@/features/meals/components/meal-edit-modal";
import {
  ALLOWED_PHOTO_MIME_TYPES,
  MAX_PHOTO_BYTES,
  PhotoTab,
} from "@/features/meals/components/photo-tab";
import { TextTab } from "@/features/meals/components/text-tab";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type CaptureTab = "photo" | "texte";

type PendingAnalysis = {
  items: MealItem[];
  mealType: MealType;
  photoUrl: string | null;
};

/**
 * Meal capture entry point (TICK-009). Renders a "+" trigger that opens a
 * Drawer (mobile, < 768px) or a Dialog (desktop) with the same inner
 * content: meal-type selector, Photo/Texte tabs, and an "Analyser mon
 * repas" action. On success it hands the AI result off to
 * <MealEditModal /> (TICK-010) for review before saving.
 */
export function MealInputDrawer() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { user } = useUser();
  const queryClient = useQueryClient();
  const analyzeMeal = useAnalyzeMealMutation();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CaptureTab>("photo");
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<PendingAnalysis | null>(
    null
  );

  const resetForm = useCallback(() => {
    setActiveTab("photo");
    setMealType(null);
    setPhotoFile(null);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setTextDescription("");
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handlePhotoSelected = (file: File | null) => {
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setPhotoFile(file);
  };

  const isBusy = isUploading || analyzeMeal.isPending;

  const handleAnalyze = async () => {
    if (!mealType) {
      toast.error("Sélectionne un type de repas.");
      return;
    }
    if (activeTab === "photo" && !photoFile) {
      toast.error("Ajoute une photo ou passe en mode texte.");
      return;
    }
    if (activeTab === "texte" && textDescription.trim().length === 0) {
      toast.error("Décris ton repas ou ajoute une photo.");
      return;
    }

    let uploadedPath: string | null = null;
    let imageUrl: string | undefined;

    if (activeTab === "photo" && photoFile) {
      if (!user) {
        toast.error("Tu dois être connecté pour analyser une photo.");
        return;
      }
      if (photoFile.size > MAX_PHOTO_BYTES) {
        toast.error("Image trop volumineuse (5 Mo maximum).");
        return;
      }
      if (!ALLOWED_PHOTO_MIME_TYPES.has(photoFile.type)) {
        toast.error("Format non supporté (jpeg, png ou webp uniquement).");
        return;
      }

      setIsUploading(true);
      try {
        const supabase = createClient();
        const normalizedBlob = await normalizeMealImage(photoFile);
        const path = `${user.id}/${crypto.randomUUID()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("meal-photos")
          .upload(path, normalizedBlob, { contentType: "image/jpeg" });

        if (uploadError) {
          toast.error("Échec du téléversement de la photo.");
          return;
        }

        // The bucket is private (RLS-scoped to `{user_id}/…`), so a signed
        // URL is required for the analyze-meal endpoint to fetch the image.
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("meal-photos")
          .createSignedUrl(path, 600);

        if (signedUrlError || !signedUrlData) {
          toast.error("Échec de la génération du lien de la photo.");
          return;
        }

        uploadedPath = path;
        imageUrl = signedUrlData.signedUrl;
      } finally {
        setIsUploading(false);
      }
    }

    try {
      const result = await analyzeMeal.mutateAsync(
        activeTab === "photo"
          ? { imageUrl }
          : { textDescription: textDescription.trim() }
      );

      setPendingAnalysis({
        items: result.items,
        mealType,
        photoUrl: uploadedPath,
      });
      setOpen(false);
      resetForm();
    } catch {
      // useAnalyzeMealMutation already surfaces an error toast.
    }
  };

  const captureContent = (
    <div className="flex flex-col gap-4 px-4 pb-2">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          Type de repas
        </p>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={mealType === option.value ? "default" : "outline"}
              onClick={() => setMealType(option.value)}
              disabled={isBusy}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as CaptureTab)}
      >
        <TabsList className="w-full">
          <TabsTrigger value="photo" className="flex-1">
            Photo
          </TabsTrigger>
          <TabsTrigger value="texte" className="flex-1">
            Texte
          </TabsTrigger>
        </TabsList>
        <TabsContent value="photo">
          <PhotoTab
            preview={photoPreview}
            onFileSelected={handlePhotoSelected}
            disabled={isBusy}
          />
        </TabsContent>
        <TabsContent value="texte">
          <TextTab
            value={textDescription}
            onChange={setTextDescription}
            disabled={isBusy}
          />
        </TabsContent>
      </Tabs>
    </div>
  );

  const analyzeButton = (
    <Button onClick={handleAnalyze} disabled={isBusy} className="w-full">
      {isBusy ? (
        <>
          <Loader2 className="animate-spin" />
          Analyse en cours...
        </>
      ) : (
        "Analyser mon repas"
      )}
    </Button>
  );

  const triggerButton = (
    <Button
      type="button"
      size="icon-lg"
      className="fixed right-6 bottom-24 z-40 rounded-full shadow-lg shadow-primary/30"
      aria-label="Ajouter un repas"
    >
      <Plus />
    </Button>
  );

  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>{triggerButton}</DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau repas</DialogTitle>
              <DialogDescription>
                Prends une photo ou décris ton repas pour lancer l&apos;analyse
                IA.
              </DialogDescription>
            </DialogHeader>
            {captureContent}
            <DialogFooter>{analyzeButton}</DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Nouveau repas</DrawerTitle>
              <DrawerDescription>
                Prends une photo ou décris ton repas pour lancer l&apos;analyse
                IA.
              </DrawerDescription>
            </DrawerHeader>
            {captureContent}
            <DrawerFooter>{analyzeButton}</DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {pendingAnalysis && (
        <MealEditModal
          open
          onOpenChange={(next) => {
            if (!next) setPendingAnalysis(null);
          }}
          items={pendingAnalysis.items}
          mealType={pendingAnalysis.mealType}
          photoUrl={pendingAnalysis.photoUrl}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["meals"] });
            setPendingAnalysis(null);
          }}
        />
      )}
    </>
  );
}
