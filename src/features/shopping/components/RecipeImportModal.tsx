"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Image, FileText, Upload, X, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useExtractGroceriesMutation } from "../hooks/use-extract-groceries-mutation";
import { saveGroceryItemsAction } from "../actions";
import type { GroceryItem, RecipeGroceriesResponse } from "@/lib/validators/recipeGroceriesSchema";

interface RecipeImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
}

function useIsDesktop() {
  if (typeof window === "undefined") return true;
  return window.innerWidth >= 768;
}

function ImportContent({
  listId,
  onSuccess,
}: {
  listId: string;
  onSuccess: () => void;
}) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [textRecipes, setTextRecipes] = useState("");
  const [result, setResult] = useState<RecipeGroceriesResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extract = useExtractGroceriesMutation();
  const [saving, setSaving] = useState(false);

  const compressToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const MAX_DIM = 1024;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) { h = Math.round((h * MAX_DIM) / w); w = MAX_DIM; }
          else { w = Math.round((w * MAX_DIM) / h); h = MAX_DIM; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(canvas.toDataURL("image/jpeg", 0.7)); return; }
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(); };
      img.src = objectUrl;
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (imageUrls.length + files.length > 10) {
      toast.error("Maximum 10 images");
      return;
    }
    e.target.value = "";
    for (const file of files) {
      try {
        const compressed = await compressToBase64(file);
        setImageUrls((prev) => [...prev, compressed]);
      } catch {
        toast.error(`Impossible de charger ${file.name}`);
      }
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExtract = async (tab: "photos" | "text") => {
    const payload =
      tab === "photos"
        ? { images: imageUrls }
        : { textRecipes };

    extract.mutate(payload, {
      onSuccess: (data) => setResult(data),
      onError: (err) => toast.error(err.message ?? "Erreur IA"),
    });
  };

  const handleSave = async () => {
    if (!result || !listId) return;
    setSaving(true);
    const res = await saveGroceryItemsAction(listId, result.items);
    setSaving(false);
    if (res.success) {
      toast.success(`${res.data.count} articles ajoutés à votre liste`);
      onSuccess();
    } else {
      toast.error(res.error);
    }
  };

  const groupedItems = result?.items.reduce<Record<string, GroceryItem[]>>(
    (acc, item) => {
      (acc[item.aisle] ??= []).push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      {!result ? (
        <Tabs defaultValue="photos">
          <TabsList className="w-full">
            <TabsTrigger value="photos" className="flex-1 gap-2">
              <Image className="h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="text" className="flex-1 gap-2">
              <FileText className="h-4 w-4" />
              Texte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="space-y-4 mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">Ajouter des photos de recettes</span>
              <span className="text-xs">JPEG, PNG, WebP — max 10 images</span>
            </button>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Recette ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
                    >
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              className="w-full gap-2"
              disabled={imageUrls.length === 0 || extract.isPending}
              onClick={() => handleExtract("photos")}
            >
              {extract.isPending ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Extraire les ingrédients
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-4 mt-4">
            <Textarea
              placeholder="Collez ici le texte de votre recette (ingrédients, instructions)..."
              rows={8}
              value={textRecipes}
              onChange={(e) => setTextRecipes(e.target.value)}
              className="resize-none"
            />
            <Button
              className="w-full gap-2"
              disabled={!textRecipes.trim() || extract.isPending}
              onClick={() => handleExtract("text")}
            >
              {extract.isPending ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Extraire les ingrédients
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          {extract.isPending && (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          )}

          {/* Recipe summaries */}
          {result.recipes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.recipes.map((r, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {r.title}
                  {r.servings ? ` · ${r.servings} pers.` : ""}
                  {r.calories ? ` · ${r.calories} kcal` : ""}
                </Badge>
              ))}
            </div>
          )}

          {/* Grouped items */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {Object.entries(groupedItems ?? {}).map(([aisle, aisleItems]) => (
              <div key={aisle}>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">{aisle}</p>
                <div className="space-y-1">
                  {aisleItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50"
                    >
                      <span className="text-sm">{item.name}</span>
                      <div className="flex items-center gap-2">
                        {item.quantity > 0 && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {item.quantity} {item.unit}
                          </span>
                        )}
                        {item.is_pantry_staple && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            placard
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setResult(null)}
            >
              Recommencer
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleSave}
              disabled={saving}
            >
              <CheckCircle2 className="h-4 w-4" />
              Générer ma liste
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function RecipeImportModal({ open, onOpenChange, listId }: RecipeImportModalProps) {
  const isDesktop = useIsDesktop();

  const handleSuccess = () => {
    onOpenChange(false);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Importer une recette</DialogTitle>
          </DialogHeader>
          <ImportContent listId={listId} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="px-4 pb-6">
        <DrawerHeader className="px-0">
          <DrawerTitle>Importer une recette</DrawerTitle>
        </DrawerHeader>
        <ImportContent listId={listId} onSuccess={handleSuccess} />
      </DrawerContent>
    </Drawer>
  );
}
