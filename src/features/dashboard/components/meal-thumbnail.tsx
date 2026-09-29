"use client";

import { useQuery } from "@tanstack/react-query";
import { UtensilsCrossed } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Meal card thumbnail (TICK-012). `photo_url` is a private Storage path
 * (`{user_id}/{uuid}.ext` in the `meal-photos` bucket), so it needs a signed
 * URL generated client-side to be displayable — cached for 55 minutes
 * (the signed URL itself is valid 1h) so re-renders don't regenerate it.
 */
export function MealThumbnail({ photoPath }: { photoPath: string | null }) {
  const signedUrlQuery = useQuery({
    queryKey: ["meal-photo-signed-url", photoPath],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("meal-photos")
        .createSignedUrl(photoPath!, 3600);

      if (error || !data) return null;
      return data.signedUrl;
    },
    enabled: !!photoPath,
    staleTime: 55 * 60 * 1000,
  });

  return (
    <Avatar size="lg" className="rounded-lg after:rounded-lg">
      {signedUrlQuery.data && (
        <AvatarImage src={signedUrlQuery.data} alt="" className="rounded-lg" />
      )}
      <AvatarFallback className="rounded-lg">
        <UtensilsCrossed className="size-4 text-muted-foreground" />
      </AvatarFallback>
    </Avatar>
  );
}
