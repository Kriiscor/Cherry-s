import { NextRequest, NextResponse } from "next/server";
import {
  aiMealAnalysisSchema,
  aiMealRequestSchema,
} from "@/lib/validators/aiMealSchema";
import {
  MEAL_TEXT_MODEL,
  MEAL_VISION_MODEL,
  replicate,
} from "@/lib/replicate/client";
import { runWithReplicateRetry } from "@/lib/replicate/retry";
import { createRateLimiter } from "@/lib/rate-limit";

/** 5 MB — max accepted size for the fetched meal photo. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
/** 1 MB — the JSON body only ever holds a URL + a short description. */
const MAX_REQUEST_BODY_BYTES = 1 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// Built once per server instance; `.limit()` is called per request below.
const rateLimiter = createRateLimiter(10, "1 m");

const SYSTEM_PROMPT = `Tu es un nutritionniste expert en analyse alimentaire. On te fournit une photo de repas et/ou une description textuelle. Tu dois estimer, pour CHAQUE aliment distinct visible ou décrit, son poids et ses valeurs nutritionnelles.

Règles strictes de sortie :
- Réponds UNIQUEMENT avec un tableau JSON valide, rien d'autre.
- Pas de balises markdown (pas de \`\`\`), pas de commentaire, pas de texte avant ou après.
- N'échappe JAMAIS les tirets bas dans les noms de clés (écris "item_name" et NON PAS "item\\_name").
- Le tableau doit respecter exactement ce format :
[
  {
    "item_name": "string",
    "weight_grams": number,
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  }
]
- Toutes les valeurs numériques doivent être des nombres positifs (pas de chaînes, pas de null).
- N'inclus aucune clé supplémentaire.`;

class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "anonymous";
  }
  return request.headers.get("x-real-ip") ?? "anonymous";
}

/**
 * Fetches the candidate meal photo and validates its declared/actual size
 * and MIME type before it is ever handed to the AI model. Guards against a
 * URL that lies about its Content-Length by aborting mid-stream as soon as
 * the real byte count crosses the limit.
 */
async function validateImageUrl(imageUrl: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(imageUrl);
  } catch {
    throw new HttpError(400, "Impossible de récupérer l'image fournie.");
  }

  if (!response.ok || !response.body) {
    throw new HttpError(400, "Impossible de récupérer l'image fournie.");
  }

  const contentType =
    response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ??
    "";
  if (!ALLOWED_IMAGE_MIME_TYPES.has(contentType)) {
    throw new HttpError(
      400,
      "Type de fichier non supporté (jpeg, png ou webp uniquement)."
    );
  }

  const declaredLength = Number(response.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_IMAGE_BYTES) {
    throw new HttpError(413, "Image trop volumineuse (5 Mo maximum).");
  }

  // Defend against a response that lies about its Content-Length: read the
  // stream and bail out as soon as the real byte count crosses the limit.
  const reader = response.body.getReader();
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_IMAGE_BYTES) {
      throw new HttpError(413, "Image trop volumineuse (5 Mo maximum).");
    }
  }
}

function outputToText(output: unknown): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return output.map((chunk) => String(chunk)).join("");
  return String(output);
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

/**
 * Normalizes invalid markdown-style escapes (such as \_ or \') produced by models
 * like LLaVA, restoring valid JSON syntax (RFC 8259).
 */
function sanitizeJsonString(text: string): string {
  return text.replace(/\\([_'"*&#])/g, "$1");
}

/**
 * Vision models (e.g. llava-13b) don't reliably stop at the JSON array —
 * they often append explanatory prose afterwards despite instructions not
 * to. Extract just the `[...]` substring (first `[` to its matching `]`)
 * instead of assuming the whole response is valid JSON.
 */
function extractJsonArray(text: string): string {
  const start = text.indexOf("[");
  if (start === -1) return text;

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "[") depth++;
    else if (text[i] === "]") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start);
}

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
  if (
    contentLengthHeader &&
    Number(contentLengthHeader) > MAX_REQUEST_BODY_BYTES
  ) {
    return NextResponse.json(
      { error: "Requête trop volumineuse." },
      { status: 413 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 }
    );
  }

  const parseResult = aiMealRequestSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error:
          parseResult.error.issues[0]?.message ?? "Requête invalide.",
        issues: parseResult.error.issues,
      },
      { status: 400 }
    );
  }

  const { imageUrl, textDescription, correction, previousItems } = parseResult.data;

  try {
    if (imageUrl) {
      await validateImageUrl(imageUrl);
    }

    let userPrompt: string;
    if (correction) {
      const prevJson =
        previousItems && previousItems.length > 0
          ? JSON.stringify(previousItems, null, 2)
          : "[]";
      userPrompt = `Analyse précédente :\n${prevJson}\n\nL'utilisateur précise : ${correction}\n\nMets à jour l'analyse complète en tenant compte de cette précision. Renvoie le tableau JSON complet mis à jour avec tous les aliments (anciens et nouveaux).`;
    } else {
      const parts = [
        textDescription
          ? `Description fournie par l'utilisateur : ${textDescription}`
          : null,
        imageUrl ? "Analyse la photo du repas fournie." : null,
      ].filter((part): part is string => Boolean(part));
      userPrompt = parts.join("\n") || "Analyse ce repas.";
    }

    // Corrections never carry an image — always use the text model.
    // Two different models depending on input type: llava-13b (vision)
    // requires an `image` and has no separate system_prompt field, so the
    // instructions are folded into `prompt`; the text-only model matches the
    // more common prompt/system_prompt/max_tokens/temperature shape.
    const model = imageUrl && !correction ? MEAL_VISION_MODEL : MEAL_TEXT_MODEL;
    const input: Record<string, unknown> = imageUrl && !correction
      ? {
          image: imageUrl,
          prompt: `${SYSTEM_PROMPT}\n\n${userPrompt}`,
          max_tokens: 1024,
          temperature: 0.2,
        }
      : {
          prompt: userPrompt,
          system_prompt: SYSTEM_PROMPT,
          max_tokens: 1024,
          temperature: 0.2,
        };

    const output = await runWithReplicateRetry(() =>
      replicate.run(model, { input })
    );
    const rawText = outputToText(output);
    const text = sanitizeJsonString(extractJsonArray(stripJsonFences(rawText)));

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(text);
    } catch {
      console.error("[analyze-meal] Réponse IA non-JSON:", text.slice(0, 200));
      return NextResponse.json(
        { error: "Réponse IA invalide, veuillez réessayer." },
        { status: 500 }
      );
    }

    const analysis = aiMealAnalysisSchema.safeParse(parsedJson);
    if (!analysis.success) {
      console.error(
        "[analyze-meal] Réponse IA mal formée:",
        analysis.error.issues
      );
      return NextResponse.json(
        { error: "Réponse IA invalide, veuillez réessayer." },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: analysis.data }, { status: 200 });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    const err = error as {
      response?: { status?: number };
      status?: number;
      message?: string;
    };
    const is429 =
      err?.response?.status === 429 ||
      err?.status === 429 ||
      (typeof err?.message === "string" &&
        (err.message.includes("429") || err.message.includes("throttled")));

    if (is429) {
      return NextResponse.json(
        { error: "L'IA est temporairement surchargée, veuillez réessayer dans quelques instants." },
        { status: 429 }
      );
    }

    const is503 =
      err?.response?.status === 503 ||
      err?.status === 503 ||
      (typeof err?.message === "string" &&
        (err.message.includes("unavailable") ||
          err.message.includes("high demand") ||
          err.message.includes("E003")));

    if (is503) {
      return NextResponse.json(
        { error: "Le service d'analyse IA est momentanément indisponible, veuillez réessayer." },
        { status: 503 }
      );
    }

    console.error(
      "[analyze-meal] Erreur inattendue:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
