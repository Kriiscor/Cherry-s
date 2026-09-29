import { z } from "zod";

/**
 * Payload for the "Connexion" (login) form. Password rules are enforced at
 * sign-up time only — login just needs a non-empty password so Supabase can
 * return its own "Identifiants invalides" style error.
 */
export const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Payload for the "Inscription" (register) form. Password must be at least
 * 8 characters and contain at least one letter and one digit — no other
 * complexity rules.
 */
export const registerSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
      "Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre"
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Le mot de passe est requis")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
        "Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre"
      ),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
