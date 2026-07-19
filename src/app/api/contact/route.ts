import { NextResponse } from "next/server";
import nodemailer, { type Transporter } from "nodemailer";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";

const INTEREST_LABEL: Record<string, string> = {
  buy: "Comprar",
  sell: "Vender",
  rent: "Alquilar",
  invest: "Invertir",
};

// Lightweight per-IP guard: sliding 1-hour window, in-memory. State is
// per-instance and resets on redeploy — acceptable for a low-traffic
// public endpoint that sends email.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Labeled form fields, in the order the agents should read them. */
function buildFields(data: ContactInput): Array<[string, string]> {
  const fields: Array<[string, string]> = [];
  if (data.referencia) fields.push(["Referencia", data.referencia]);
  if (data.propiedad) fields.push(["Propiedad", data.propiedad]);
  if (data.servicioRef) fields.push(["Servicio", data.servicioRef]);
  fields.push(
    ["Nombre", data.name],
    ["Email", data.email],
    ["Teléfono", data.phone],
    ["Interés", INTEREST_LABEL[data.interest] ?? data.interest],
  );
  if (data.budget) fields.push(["Presupuesto", data.budget]);
  if (data.area) fields.push(["Zona preferida", data.area]);
  fields.push(["Consentimiento", "Sí"]);
  return fields;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Honeypot: silently accept and drop bot submissions (mirrors the client).
  if (body && typeof body === "object" && (body as { website?: string }).website) {
    return NextResponse.json({ ok: true });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limit" }, { status: 429 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }
  const data = parsed.data;

  const { SMTP_HOST, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;

  // Unconfigured SMTP: simulate success so the flow is demoable before real
  // credentials land. Real sending activates once the env vars are set.
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
    console.info("[contact] SMTP not configured — simulating success", {
      from: data.email,
    });
    return NextResponse.json({ ok: true, simulated: true });
  }

  const fields = buildFields(data);
  const subject = `Nueva consulta web — ${INTEREST_LABEL[data.interest] ?? data.interest} — ${data.name}`;

  const text = [
    ...fields.map(([label, value]) => `${label}: ${value}`),
    "",
    "Mensaje:",
    data.message,
  ].join("\n");

  const html = [
    `<h2 style="margin:0 0 16px;font-weight:600">Nueva consulta web</h2>`,
    `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">`,
    ...fields.map(
      ([label, value]) =>
        `<tr><td style="padding:2px 16px 2px 0;color:#666">${label}</td>` +
        `<td style="padding:2px 0">${escapeHtml(value)}</td></tr>`,
    ),
    `</table>`,
    `<p style="margin:16px 0 4px;color:#666">Mensaje</p>`,
    `<p style="margin:0;white-space:pre-line">${escapeHtml(data.message)}</p>`,
  ].join("\n");

  try {
    await getTransporter().sendMail({
      from: `"Casa Madre — Web" <${SMTP_USER}>`,
      to: CONTACT_TO,
      replyTo: data.email,
      subject,
      text,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact] SMTP send failed", error);
    return NextResponse.json({ ok: false, error: "send" }, { status: 500 });
  }
}
