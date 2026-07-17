import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

/**
 * AI draft generator (server-only) for the Studio composers.
 *
 * Handles both content types behind one route, selected by `contentType`:
 *  - "article":  Journal posts (topic + notes + category → title/excerpt/body).
 *  - "property": Property listings (structured facts + agent notes →
 *                title/description/highlights). The model may ONLY use the
 *                facts and notes it is given — inventing features is forbidden
 *                by the system prompt.
 *
 * ⚠️ COST / SAFETY: this calls the paid Anthropic API. The key
 * (ANTHROPIC_API_KEY) is read from the server environment and is NEVER exposed
 * to the browser or the Sanity Studio bundle — this route runs only on the
 * server, and the Studio actions call it over fetch. Do not move the key or the
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

// Labels mirror the option lists in the property schema (schemaTypes/property.ts).
const OPERATION_LABELS: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  piso: "Piso",
  atico: "Ático",
  casa: "Casa / Chalet",
  duplex: "Dúplex",
  estudio: "Estudio",
  local: "Local / Comercial",
};

// Casa Madre brand voice (build brief §2). Embedded in the system prompts so
// every draft lands in the firm's register: warm, editorial, premium,
// Mediterranean and clear — never cold/corporate or overly poetic.
const BRAND_VOICE = `Casa Madre es una inmobiliaria boutique de Barcelona (compra, venta, alquiler e inversión de propiedades premium).

VOZ DE MARCA:
- Cálida, editorial, cercana y humana; premium sin ser fría ni corporativa.
- Palabras de marca: boutique, elegante, mediterránea, cercana, premium, editorial, cálida, discreta.
- Claridad ante todo: emocional pero concreta. Que se entienda lo que hacemos.

EVITA:
- Tono agresivo o de venta dura. Nada de signos de exclamación.
- Clichés genéricos del sector inmobiliario ("la casa de tus sueños", "ubicación inmejorable", "oportunidad única").
- Lujo frío y distante.
- Lenguaje excesivamente poético o abstracto que esconda el contenido real.

IDIOMA:
- El español es el texto principal y aprobado.
- El inglés es una adaptación natural (no una traducción literal), manteniendo el mismo registro premium, cálido y editorial.`;

const ARTICLE_SYSTEM_PROMPT = `Eres redactor editorial de Casa Madre.

${BRAND_VOICE}

FORMATO DEL CUERPO:
- Devuelve el cuerpo como un array de párrafos (cadenas de texto), sin Markdown ni encabezados.
- Entre 5 y 9 párrafos, con ritmo editorial y frases con aire.`;

const PROPERTY_SYSTEM_PROMPT = `Eres redactor de fichas de propiedades de Casa Madre.

${BRAND_VOICE}

REGLAS DE CONTENIDO (obligatorias):
- Usa ÚNICAMENTE los datos estructurados y las notas del agente que se te proporcionan.
- NUNCA inventes características, medidas, orientaciones, reformas o servicios que no se indiquen.
- Si no hay notas del agente, redacta solo a partir de los datos estructurados y sé más breve; no rellenes con generalidades.

FORMATO:
- Título: corto y evocador, uno por idioma (p. ej. "Ático reformado con terraza en Gràcia").
- Descripción: 2–3 párrafos breves por idioma, como array de cadenas, sin Markdown.
- Destacados (highlights): de 3 a 6 etiquetas concisas en español, extraídas solo de los datos y notas (p. ej. "Terraza", "Reformado", "Luz natural").`;

const articleDraftSchema = z.object({
  titleEs: z.string().min(1),
  titleEn: z.string().min(1),
  excerptEs: z.string().min(1),
  excerptEn: z.string().min(1),
  bodyEs: z.array(z.string().min(1)).min(1),
  bodyEn: z.array(z.string().min(1)).min(1),
});

const propertyDraftSchema = z.object({
  titleEs: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionEs: z.array(z.string().min(1)).min(1),
  descriptionEn: z.array(z.string().min(1)).min(1),
  highlights: z.array(z.string().min(1)).min(1),
});

const requestSchema = z.discriminatedUnion("contentType", [
  z.object({
    contentType: z.literal("article"),
    topic: z.string().min(1, "Falta el tema"),
    notes: z.string().optional().default(""),
    category: z.string().optional().default(""),
  }),
  z.object({
    contentType: z.literal("property"),
    notes: z.string().optional().default(""),
    facts: z.object({
      operation: z.string().min(1),
      propertyType: z.string().min(1),
      neighbourhood: z.string().min(1),
      price: z.number().positive(),
      surface: z.number().positive().optional(),
      bedrooms: z.number().int().min(0).optional(),
      bathrooms: z.number().int().min(0).optional(),
    }),
  }),
]);

type DraftRequest = z.infer<typeof requestSchema>;

function buildArticlePrompt(
  req: Extract<DraftRequest, { contentType: "article" }>,
) {
  const categoryLabel = CATEGORY_LABELS[req.category] ?? req.category;
  return `Escribe un artículo para el Journal de Casa Madre.

Tema: ${req.topic}
${categoryLabel ? `Categoría: ${categoryLabel}` : ""}
${req.notes ? `Notas e indicaciones: ${req.notes}` : ""}

Devuelve ÚNICAMENTE un objeto JSON válido (sin texto antes o después, sin bloques de código Markdown) con esta forma exacta:
{
  "titleEs": "título en español",
  "titleEn": "title in English",
  "excerptEs": "resumen breve en español (1-2 frases)",
  "excerptEn": "short excerpt in English (1-2 sentences)",
  "bodyEs": ["párrafo 1", "párrafo 2", "..."],
  "bodyEn": ["paragraph 1", "paragraph 2", "..."]
}`;
}

function buildPropertyPrompt(
  req: Extract<DraftRequest, { contentType: "property" }>,
) {
  const { facts, notes } = req;
  const price = `${new Intl.NumberFormat("es-ES").format(facts.price)} €${
    facts.operation === "alquiler" ? "/mes" : ""
  }`;
  const lines = [
    `- Operación: ${OPERATION_LABELS[facts.operation] ?? facts.operation}`,
    `- Tipo: ${PROPERTY_TYPE_LABELS[facts.propertyType] ?? facts.propertyType}`,
    `- Barrio: ${facts.neighbourhood}`,
    `- Precio: ${price}`,
    facts.surface != null ? `- Superficie: ${facts.surface} m²` : null,
    facts.bedrooms != null ? `- Dormitorios: ${facts.bedrooms}` : null,
    facts.bathrooms != null ? `- Baños: ${facts.bathrooms}` : null,
  ].filter(Boolean);

  return `Redacta la ficha de esta propiedad para Casa Madre.

DATOS ESTRUCTURADOS (única fuente de información, junto con las notas):
${lines.join("\n")}

${notes ? `Notas del agente: ${notes}` : "No hay notas del agente: redacta solo con los datos estructurados y sé breve."}

Devuelve ÚNICAMENTE un objeto JSON válido (sin texto antes o después, sin bloques de código Markdown) con esta forma exacta:
{
  "titleEs": "título corto y evocador en español",
  "titleEn": "short, evocative title in English",
  "descriptionEs": ["párrafo 1", "párrafo 2", "..."],
  "descriptionEn": ["paragraph 1", "paragraph 2", "..."],
  "highlights": ["Etiqueta", "..."]
}`;
}

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
      {
        ok: false,
        error:
          "Faltan datos para generar el borrador. Revisa los campos obligatorios.",
      },
      { status: 400 },
    );
  }
  const req = parsedReq.data;

  const isArticle = req.contentType === "article";
  const systemPrompt = isArticle
    ? ARTICLE_SYSTEM_PROMPT
    : PROPERTY_SYSTEM_PROMPT;
  const userPrompt = isArticle
    ? buildArticlePrompt(req)
    : buildPropertyPrompt(req);
  const draftSchema = isArticle ? articleDraftSchema : propertyDraftSchema;

  const anthropic = new Anthropic({ apiKey });

  let rawText: string;
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    rawText = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { text: string }).text)
      .join("")
      .trim();
  } catch (err) {
    console.error("[ai/draft] Anthropic request failed", err);
    return NextResponse.json(
      { ok: false, error: "Error al contactar con la IA. Inténtalo de nuevo." },
      { status: 502 },
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(extractJson(rawText));
  } catch {
    console.error("[ai/draft] Could not parse model output", rawText);
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
