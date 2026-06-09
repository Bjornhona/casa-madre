import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact-schema";

const INTEREST_LABEL: Record<string, string> = {
  buy: "Comprar",
  sell: "Vender",
  rent: "Alquilar",
  invest: "Invertir",
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Honeypot: silently accept and drop bot submissions.
  if (body && typeof body === "object" && (body as { website?: string }).website) {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }
  const data = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  // Placeholder/unconfigured key: simulate success so the flow is demoable
  // before real credentials land. Real sending activates once a key is set.
  if (!apiKey || apiKey === "re_placeholder") {
    console.info("[contact] Resend not configured — simulating success", {
      to,
      from: data.email,
    });
    return NextResponse.json({ ok: true, simulated: true });
  }

  if (!to) {
    return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  // CTA context (property/service the enquiry came from), surfaced at the top of
  // the email and in the subject line.
  const referenceLabel = data.referencia || data.servicioRef || "";
  const contexto: string[] = [];
  if (data.referencia) {
    contexto.push(
      `Propiedad: ${data.referencia}${data.propiedad ? ` (${data.propiedad})` : ""}`,
    );
  } else if (data.servicioRef) {
    contexto.push(`Servicio: ${data.servicioRef}`);
  }

  const lines = [
    ...(contexto.length ? ["Contexto", ...contexto, ""] : []),
    `Nombre: ${data.name}`,
    `Email: ${data.email}`,
    `Teléfono: ${data.phone}`,
    `Interés: ${INTEREST_LABEL[data.interest] ?? data.interest}`,
    data.budget ? `Presupuesto: ${data.budget}` : null,
    data.area ? `Zona preferida: ${data.area}` : null,
    "",
    data.message,
  ].filter(Boolean);

  const subject = referenceLabel
    ? `Nueva consulta — ${referenceLabel} · Casa Madre`
    : "Nueva consulta · Casa Madre";

  try {
    const { error } = await resend.emails.send({
      from: "Casa Madre <onboarding@resend.dev>",
      to: [to],
      replyTo: data.email,
      subject,
      text: lines.join("\n"),
    });
    if (error) {
      return NextResponse.json({ ok: false, error: "send" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "send" }, { status: 502 });
  }
}
