"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm text-muted-foreground">
        Une erreur est survenue lors du chargement.
      </p>
      {error?.message && (
        <p className="text-xs text-destructive font-mono">{error.message}</p>
      )}
      <Button onClick={reset} variant="outline" size="sm">
        Réessayer
      </Button>
    </div>
  );
}
