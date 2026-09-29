import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validators/authSchema";

/**
 * TICK-016 names `tests/backend/auth.test.ts` explicitly. There is no
 * dedicated `/api/auth` route — auth goes through
 * `supabase.auth.signInWithPassword` / `signUp` directly from the client
 * (TICK-007) — so this file guards the password/email validation rules the
 * ticket calls out instead: password >= 8 chars with a letter and a digit,
 * and a well-formed email.
 */
describe("authSchema (TICK-016 auth validation guard)", () => {
  describe("loginSchema", () => {
    it("accepts a well-formed email + any non-empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "x",
      });
      expect(result.success).toBe(true);
    });

    it("rejects a malformed email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "whatever",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Email invalide");
      }
    });

    it("rejects an empty email", () => {
      const result = loginSchema.safeParse({ email: "", password: "whatever" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("L'email est requis");
      }
    });

    it("rejects an empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Le mot de passe est requis");
      }
    });
  });

  describe("registerSchema — password rule (>= 8 chars, 1 letter, 1 digit)", () => {
    it("accepts a password meeting all three rules", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "abcd1234",
      });
      expect(result.success).toBe(true);
    });

    it("rejects a password shorter than 8 characters", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "ab1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre"
        );
      }
    });

    it("rejects a password with only letters (no digit)", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "abcdefgh",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a password with only digits (no letter)", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "12345678",
      });
      expect(result.success).toBe(false);
    });

    it("accepts a long password mixing letters, digits, and symbols", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "Sup3r-Secure-P@ssw0rd",
      });
      expect(result.success).toBe(true);
    });

    it("rejects a malformed email even with a valid password", () => {
      const result = registerSchema.safeParse({
        email: "not-an-email",
        password: "abcd1234",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "Email invalide")).toBe(true);
      }
    });

    it("rejects an empty email on register", () => {
      const result = registerSchema.safeParse({ email: "", password: "abcd1234" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "L'email est requis")).toBe(true);
      }
    });
  });
});
