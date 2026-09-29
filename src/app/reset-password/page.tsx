"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CherryLogo } from "@/components/ui/cherry-logo";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators/authSchema";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  // Exchange the PKCE code from the URL for a valid session
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      // No code — maybe already has a session (edge case)
      const supabase = createClient();
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setSessionReady(true);
        } else {
          setSessionError(true);
        }
      });
      return;
    }

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setSessionError(true);
      } else {
        setSessionReady(true);
      }
    });
  }, [searchParams]);

  async function onSubmit(values: ResetPasswordInput) {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        toast.error("Une erreur est survenue, veuillez réessayer");
        return;
      }

      toast.success("Mot de passe mis à jour !");
      router.push("/dashboard");
    } catch {
      toast.error("Une erreur est survenue, veuillez réessayer");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CherryLogo size="md" />
            Cherry&apos;s
          </CardTitle>
          <CardDescription>Choisissez un nouveau mot de passe.</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionError ? (
            <div className="flex flex-col gap-4 text-center">
              <p className="text-sm text-destructive">
                Le lien a expiré ou est invalide. Veuillez refaire une demande de
                réinitialisation.
              </p>
              <Button variant="outline" onClick={() => router.push("/login")}>
                Retour à la connexion
              </Button>
            </div>
          ) : !sessionReady ? (
            <div className="flex justify-center py-6">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Mettre à jour le mot de passe
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
