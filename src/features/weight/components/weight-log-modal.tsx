"use client";

import { useState } from "react";
import { Loader2, Scale } from "lucide-react";
import { toast } from "sonner";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useLogWeightMutation } from "@/features/weight/hooks/use-log-weight-mutation";
import { weightLogSchema } from "@/lib/validators/weightLogSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

/**
 * Quick weight entry modal (TICK-020). Dialog on desktop, Drawer on mobile.
 */
export function WeightLogModal() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const logWeight = useLogWeightMutation();

  const [open, setOpen] = useState(false);
  const [weightStr, setWeightStr] = useState("");
  const [note, setNote] = useState("");

  const reset = () => {
    setWeightStr("");
    setNote("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const handleSave = () => {
    const parsed = weightLogSchema.safeParse({
      weight_kg: weightStr,
      note: note || undefined,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Données invalides.");
      return;
    }

    logWeight.mutate(parsed.data, {
      onSuccess: () => handleOpenChange(false),
    });
  };

  const formContent = (
    <div className="flex flex-col gap-4 px-4 pb-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="weight-kg">Poids (kg)</Label>
        <Input
          id="weight-kg"
          type="number"
          step="0.1"
          min={20}
          max={300}
          inputMode="decimal"
          placeholder="75.5"
          value={weightStr}
          onChange={(event) => setWeightStr(event.target.value)}
          disabled={logWeight.isPending}
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="weight-note">Note (optionnel)</Label>
        <Textarea
          id="weight-note"
          placeholder="Ex : après sport, à jeun…"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={logWeight.isPending}
          className="h-20 resize-none"
        />
      </div>
    </div>
  );

  const saveButton = (
    <Button
      type="button"
      onClick={handleSave}
      disabled={logWeight.isPending}
      className="w-full"
    >
      {logWeight.isPending ? (
        <>
          <Loader2 className="animate-spin" />
          Enregistrement...
        </>
      ) : (
        "Enregistrer ma pesée"
      )}
    </Button>
  );

  const triggerButton = (
    <Button type="button" variant="outline" className="w-full">
      <Scale />
      Ajouter une pesée
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nouvelle pesée</DialogTitle>
            <DialogDescription>
              Enregistre ton poids du moment pour suivre ton évolution.
            </DialogDescription>
          </DialogHeader>
          {formContent}
          <DialogFooter>{saveButton}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Nouvelle pesée</DrawerTitle>
          <DrawerDescription>
            Enregistre ton poids du moment pour suivre ton évolution.
          </DrawerDescription>
        </DrawerHeader>
        {formContent}
        <DrawerFooter>{saveButton}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
