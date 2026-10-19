import { NextRequest, NextResponse } from "next/server";
import {
  recipeGroceriesRequestSchema,
  recipeGroceriesResponseSchema,
  AISLES,
} from "@/lib/validators/recipeGroceriesSchema";
import {
  MEAL_VISION_MODEL,
  MEAL_TEXT_MODEL,
  replicate,
} from "@/lib/replicate/client";
import { runWithReplicateRetry } from "@/lib/replicate/retry";
import { createRateLimiter } from "@/lib/rate-limit";

const MAX_REQUEST_BODY_BYTES = 15 * 1024 * 1024;

const rateLimiter = createRateLimiter(5, "1 m");

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "anonymous";
  return request.headers.get("x-real-ip") ?? "anonymous";
}

function outputToText(output: unknown): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return output.map((c) => String(c)).join("");
  return String(output);
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const m = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return m ? m[1].trim() : trimmed;
}

function sanitizeJson(text: string): string {
  return text.replace(/\\([_'"*&#])/g, "$1");
}

function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  if (start === -1) return text;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start);
}

const EXTRACT_SYSTEM_PROMPT = `Tu es un assistant culinaire expert. Extrais les ingrédients de la ou des recettes fournies.

Règles strictes :
- Réponds UNIQUEMENT avec un objet JSON valide, rien d'autre.
- Pas de balises markdown, pas de commentaire.
- Déduplique et fusionne les quantités identiques entre recettes.
- Classe chaque ingrédient dans un de ces rayons exactement : ${AISLES.join(", ")}.
- Marque is_pantry_staple à true pour : huile d'olive, sel, poivre, moutarde, farine, sucre, vinaigre, beurre, ail, oignon, herbes sèches.
- Format de sortie exact :
{
  "recipes": [{ "title": "string", "servings": number, "calories": number|null, "protein": number|null, "carbs": number|null, "fat": number|null }],
  "items": [{ "name": "string", "quantity": number, "unit": "string", "aisle": "string", "is_pantry_staple": boolean }]
}`;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = await rateLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Trop de requêtes, veuillez réessayer dans une minute." },
      { status: 429 }
    );
  }

  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader && Number(contentLengthHeader) > MAX_REQUEST_BODY_BYTES) {
    return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const parseResult = recipeGroceriesRequestSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Requête invalide.", issues: parseResult.error.issues },
      { status: 400 }
    );
  }

  const { images, textRecipes } = parseResult.data;

  try {
    let rawText: string;

    if (images && images.length > 0) {
      // Always exactly 1 Replicate call — analyse the first photo only.
      // Additional photos are ignored; the UI limits to 1 photo for this reason.
      const output = await runWithReplicateRetry(() =>
        replicate.run(MEAL_VISION_MODEL, {
          input: {
            image: images[0],
            prompt: `${EXTRACT_SYSTEM_PROMPT}\n\nAnalyse cette photo de recette et extrais tous les ingrédients visibles.`,
            max_tokens: 2048,
            temperature: 0.1,
          },
        })
      );
      rawText = outputToText(output);
    } else {
      // Text-only path
      const textOutput = await runWithReplicateRetry(() =>
        replicate.run(MEAL_TEXT_MODEL, {
          input: {
            prompt: `Voici le texte des recettes :\n\n${textRecipes}`,
            system_prompt: EXTRACT_SYSTEM_PROMPT,
            max_tokens: 2048,
            temperature: 0.1,
          },
        })
      );
      rawText = outputToText(textOutput);
    }

    const cleaned = sanitizeJson(extractJsonObject(stripJsonFences(rawText)));

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch {
      console.error("[extract-recipe-groceries] Réponse IA non-JSON:", cleaned.slice(0, 200));
      return NextResponse.json({ error: "Réponse IA invalide, veuillez réessayer." }, { status: 500 });
    }

    const validation = recipeGroceriesResponseSchema.safeParse(parsedJson);
    if (!validation.success) {
      console.error("[extract-recipe-groceries] Réponse mal formée:", validation.error.issues);
      return NextResponse.json({ error: "Réponse IA invalide, veuillez réessayer." }, { status: 500 });
    }

    return NextResponse.json(validation.data, { status: 200 });
  } catch (error) {
    const err = error as { response?: { status?: number }; status?: number; message?: string };
    const is429 =
      err?.response?.status === 429 ||
      err?.status === 429 ||
      (typeof err?.message === "string" && err.message.includes("429"));

    if (is429) {
      return NextResponse.json(
        { error: "L'IA est temporairement surchargée, veuillez réessayer." },
        { status: 429 }
      );
    }

    console.error("[extract-recipe-groceries] Erreur:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
