import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

/**
 * AI Journal draft generator (server-only).
 *
 * ⚠️ COST / SAFETY: this calls the paid Anthropic API. The key
 * (ANTHROPIC_API_KEY) is read from the server environment and is NEVER exposed
 * to the browser or the Sanity Studio bundle — this route runs only on the
 * server, and the Studio action calls it over fetch. Do not move the key or the
 * Anthropic client into any client component.
 */

// Cost-effective model with good editorial quality for drafts (per build brief).
const MODEL = "claude-sonnet-4-6";

const CATEGORY_LABELS: Record<string, string> = {
  barrios: "Barrios",
  lifestyle: "Lifestyle",
  inversion: "Inversión",
  interiorismo: "Interiorismo",
  guias: "Guías",
};

// Casa Madre brand voice (build brief §2). Embedded in the system prompt so
// every draft lands in the firm's register: warm, editorial, premium,
// Mediterranean and clear — never cold/corporate or overly poetic.
const SYSTEM_PROMPT = `Eres redactor editorial de Casa Madre, una inmobiliaria boutique de Barcelona (compra, venta, alquiler e inversión de propiedades premium).

VOZ DE MARCA:
- Cálida, editorial, cercana y humana; premium sin ser fría ni corporativa.
- Palabras de marca: boutique, elegante, mediterránea, cercana, premium, editorial, cálida, discreta.
- Claridad ante todo: emocional pero concreta. Que se entienda lo que hacemos.

EVITA:
- Tono agresivo o de venta dura.
- Clichés genéricos del sector inmobiliario ("la casa de tus sueños", "ubicación inmejorable").
- Lujo frío y distante.
- Lenguaje excesivamente poético o abstracto que esconda el contenido real.

IDIOMA:
- El español es el texto principal y aprobado.
- El inglés es una adaptación natural (no una traducción literal), manteniendo el mismo registro premium, cálido y editorial.

FORMATO DEL CUERPO:
- Devuelve el cuerpo como un array de párrafos (cadenas de texto), sin Markdown ni encabezados.
- Entre 5 y 9 párrafos, con ritmo editorial y frases con aire.`;

const draftSchema = z.object({
  titleEs: z.string().min(1),
  titleEn: z.string().min(1),
  excerptEs: z.string().min(1),
  excerptEn: z.string().min(1),
  bodyEs: z.array(z.string().min(1)).min(1),
  bodyEn: z.array(z.string().min(1)).min(1),
});

const requestSchema = z.object({
  topic: z.string().min(1, "Falta el tema"),
  notes: z.string().optional().default(""),
  category: z.string().optional().default(""),
});

// Strip accidental ```json fences / preamble the model may add despite being
// told to return raw JSON, then isolate the outermost JSON object.
function extractJson(text: string): string {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return t.slice(start, end + 1);
  }
  return t;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Clear, Spanish message the Studio UI can show directly.
    return NextResponse.json(
      {
        ok: false,
        error:
          "La clave ANTHROPIC_API_KEY no está configurada en el servidor. Añádela para generar borradores.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Petición no válida." },
      { status: 400 },
    );
  }

  const parsedReq = requestSchema.safeParse(body);
  if (!parsedReq.success) {
    return NextResponse.json(
      { ok: false, error: "Indica al menos un tema para el artículo." },
      { status: 400 },
    );
  }
  const { topic, notes, category } = parsedReq.data;

  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  const userPrompt = `Escribe un artículo para el Journal de Casa Madre.

Tema: ${topic}
${categoryLabel ? `Categoría: ${categoryLabel}` : ""}
${notes ? `Notas e indicaciones: ${notes}` : ""}

Devuelve ÚNICAMENTE un objeto JSON válido (sin texto antes o después, sin bloques de código Markdown) con esta forma exacta:
{
  "titleEs": "título en español",
  "titleEn": "title in English",
  "excerptEs": "resumen breve en español (1-2 frases)",
  "excerptEn": "short excerpt in English (1-2 sentences)",
  "bodyEs": ["párrafo 1", "párrafo 2", "..."],
  "bodyEn": ["paragraph 1", "paragraph 2", "..."]
}`;

  const anthropic = new Anthropic({ apiKey });

  let rawText: string;
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });
    rawText = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { text: string }).text)
      .join("")
      .trim();
  } catch (err) {
    console.error("[ai/journal-draft] Anthropic request failed", err);
    return NextResponse.json(
      { ok: false, error: "Error al contactar con la IA. Inténtalo de nuevo." },
      { status: 502 },
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(extractJson(rawText));
  } catch {
    console.error("[ai/journal-draft] Could not parse model output", rawText);
    return NextResponse.json(
      { ok: false, error: "La IA devolvió un formato inesperado. Inténtalo de nuevo." },
      { status: 502 },
    );
  }

  const parsed = draftSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "El borrador generado está incompleto. Inténtalo de nuevo." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, draft: parsed.data });
}
