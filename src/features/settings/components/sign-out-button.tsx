"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * Secure sign-out (TICK-015): calls the browser Supabase client's
 * `auth.signOut()` directly (clears the session cookies) then redirects to
 * `/login`. Client-side rather than a Server Action since it's just
 * terminating the current session, no data mutation involved.
 */
export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Impossible de vous déconnecter. Réessayez.");
        setIsSigningOut(false);
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue, veuillez réessayer");
      setIsSigningOut(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="w-full"
    >
      {isSigningOut ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      Se déconnecter
    </Button>
  );
}
