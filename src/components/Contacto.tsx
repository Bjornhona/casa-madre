"use client";

import { Suspense, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { MessageCircle, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { ContactDetails } from "@/components/ContactDetails";
import { EASE, fadeUp } from "@/lib/motion";
import { contactSchema, type ContactFormValues } from "@/lib/contact-schema";

// Functional microcopy that has no entry in the message catalog yet.
// TODO(copy): promote to `contacto.*` keys once approved by the client.
const MICROCOPY = {
  es: {
    required: "Campo obligatorio",
    email: "Email no válido",
    consent: "Debes aceptar para continuar",
    sending: "Enviando…",
    successTitle: "Gracias.",
    successBody:
      "Hemos recibido tu mensaje. Te escribiremos muy pronto.",
    error:
      "Algo salió mal. Inténtalo de nuevo o escríbenos por WhatsApp.",
    optional: "(opcional)",
  },
  en: {
    required: "Required field",
    email: "Invalid email",
    consent: "Please accept to continue",
    sending: "Sending…",
    successTitle: "Thank you.",
    successBody: "We've received your message. We'll be in touch very soon.",
    error: "Something went wrong. Please try again or reach us on WhatsApp.",
    optional: "(optional)",
  },
} as const;

type Status = "idle" | "submitting" | "success" | "error";

const INTERESTS = ["buy", "sell", "rent", "invest"] as const;
type Interest = (typeof INTERESTS)[number];

// Service slug (from CTA params) → index in the `servicios.items` catalog, so
// the reference pill reuses the approved service labels per locale.
const SERVICE_SLUG_TO_INDEX: Record<string, number> = {
  compraventa: 0,
  alquileres: 1,
  "personal-shopper": 2,
  reformas: 3,
  inversion: 4,
  juridico: 5,
};

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export function Contacto() {
  const t = useTranslations("contacto");

  return (
    <Section id="contacto" aria-labelledby="contacto-kicker">
      <Kicker id="contacto-kicker">{t("kicker")}</Kicker>
      <SerifHeading
        as="h2"
        className="mt-5 max-w-[18ch] text-[34px] leading-[1.04] text-brown sm:text-[48px]"
      >
        {t("headline")}
      </SerifHeading>

      {/* useSearchParams() must sit under a Suspense boundary in the App Router. */}
      <Suspense fallback={null}>
        <ContactoForm />
      </Suspense>

      <ContactDetails />
    </Section>
  );
}

function ContactoForm() {
  const t = useTranslations("contacto");
  const tForm = useTranslations("contacto.form");
  const tRef = useTranslations("contacto.referencia");
  const tServicios = useTranslations("servicios");
  const locale = useLocale();
  const copy = MICROCOPY[locale === "en" ? "en" : "es"];
  const reduce = useReducedMotion();
  const item = fadeUp(reduce);
  const searchParams = useSearchParams();

  // CTA context carried in the URL query string.
  const interesParam = searchParams.get("interes");
  const servicioParam = searchParams.get("servicio");
  const propiedadParam = searchParams.get("propiedad");
  const tituloParam = searchParams.get("titulo");
  const zonaParam = searchParams.get("zona");

  const serviceItems = tServicios.raw("items") as { title: string }[];
  const servicioLabel =
    servicioParam != null && SERVICE_SLUG_TO_INDEX[servicioParam] != null
      ? serviceItems[SERVICE_SLUG_TO_INDEX[servicioParam]]?.title
      : undefined;

  const validInterest: Interest = INTERESTS.includes(interesParam as Interest)
    ? (interesParam as Interest)
    : "buy";

  const messageDefault = tituloParam
    ? tRef("messageDefault").replace("[titulo]", tituloParam)
    : "";

  const [status, setStatus] = useState<Status>("idle");
  const [dismissed, setDismissed] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    // Honeypot (`website`) lives on the form type but not in the schema.
    resolver: zodResolver(contactSchema) as Resolver<ContactFormValues>,
    defaultValues: {
      interest: validInterest,
      area: zonaParam ?? "",
      message: messageDefault,
      referencia: tituloParam ?? "",
      propiedad: propiedadParam ?? "",
      servicioRef: servicioLabel ?? "",
    },
  });

  // Reference pill text — property title, else service label, else area.
  let pillText: string | null = null;
  if (tituloParam) pillText = `${tRef("pill")}: ${tituloParam}`;
  else if (servicioParam)
    pillText = `${tRef("pill")}: ${servicioLabel ?? servicioParam}`;
  else if (zonaParam) pillText = `${tRef("zona")}: ${zonaParam}`;

  const showPill = !dismissed && pillText !== null;

  function dismissReference() {
    setDismissed(true);
    // Clear the reference context from the form (leaves the visible fields).
    setValue("referencia", "");
    setValue("propiedad", "");
    setValue("servicioRef", "");
  }

  const onSubmit = async (values: ContactFormValues) => {
    // Honeypot: a filled hidden field means a bot — pretend success, send nothing.
    if (values.website) {
      setStatus("success");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  const fieldBase =
    "w-full rounded-card border bg-cream px-4 py-3 text-[15px] text-deep placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown";
  const labelBase =
    "block text-[11px] font-medium uppercase tracking-[0.16em] text-brown";

  function fieldClass(hasError: boolean) {
    return `${fieldBase} ${hasError ? "border-clay" : "border-line"}`;
  }

  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
      {/* Form / success state */}
      <motion.div
        variants={item}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {status === "success" ? (
          <div
            role="status"
            className="flex flex-col items-start gap-4 rounded-card border border-line bg-cream p-10"
          >
            <CheckCircle2 className="h-8 w-8 text-clay" strokeWidth={1.25} aria-hidden />
            <p className="font-serif text-[30px] font-medium tracking-[-0.035em] text-brown">
              {copy.successTitle}
            </p>
            <p className="max-w-[32rem] text-[16px] leading-[1.6] text-deep/80">
              {copy.successBody}
            </p>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Honeypot — off-screen, never shown to humans. */}
            <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register("website")}
              />
            </div>

            {/* CTA context — sent with the form so the email can reference it. */}
            <input type="hidden" {...register("referencia")} />
            <input type="hidden" {...register("propiedad")} />
            <input type="hidden" {...register("servicioRef")} />

            {showPill && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex items-center gap-3 self-start rounded-card border border-clay/60 bg-ivory px-4 py-2.5"
              >
                <span className="text-[13px] font-light text-brown">{pillText}</span>
                <button
                  type="button"
                  onClick={dismissReference}
                  aria-label={tRef("dismissLabel")}
                  className="text-[13px] leading-none text-brown/55 transition-colors duration-300 hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
                >
                  <span aria-hidden>{tRef("dismiss")}</span>
                </button>
              </motion.div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelBase}>
                  {tForm("name")}
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  aria-invalid={errors.name ? "true" : undefined}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`mt-2 ${fieldClass(!!errors.name)}`}
                  {...register("name")}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-[12px] text-clay">
                    {copy.required}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className={labelBase}>
                  {tForm("email")}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email ? "true" : undefined}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`mt-2 ${fieldClass(!!errors.email)}`}
                  {...register("email")}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-[12px] text-clay">
                    {copy.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className={labelBase}>
                  {tForm("phone")}
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={errors.phone ? "true" : undefined}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className={`mt-2 ${fieldClass(!!errors.phone)}`}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p id="phone-error" className="mt-1.5 text-[12px] text-clay">
                    {copy.required}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="interest" className={labelBase}>
                  {tForm("interest")}
                </label>
                <select
                  id="interest"
                  className={`mt-2 ${fieldClass(false)}`}
                  {...register("interest")}
                >
                  {INTERESTS.map((key) => (
                    <option key={key} value={key}>
                      {tForm(`interestOptions.${key}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="budget" className={labelBase}>
                  {tForm("budget")}{" "}
                  <span className="font-normal lowercase tracking-normal text-muted">
                    {copy.optional}
                  </span>
                </label>
                <input
                  id="budget"
                  type="text"
                  className={`mt-2 ${fieldClass(false)}`}
                  {...register("budget")}
                />
              </div>

              <div>
                <label htmlFor="area" className={labelBase}>
                  {tForm("area")}{" "}
                  <span className="font-normal lowercase tracking-normal text-muted">
                    {copy.optional}
                  </span>
                </label>
                <input
                  id="area"
                  type="text"
                  className={`mt-2 ${fieldClass(false)}`}
                  {...register("area")}
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className={labelBase}>
                {tForm("message")}
              </label>
              <textarea
                id="message"
                rows={5}
                aria-invalid={errors.message ? "true" : undefined}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={`mt-2 resize-y ${fieldClass(!!errors.message)}`}
                {...register("message")}
              />
              {errors.message && (
                <p id="message-error" className="mt-1.5 text-[12px] text-clay">
                  {copy.required}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="consent" className="flex items-start gap-3 text-[14px] leading-[1.5] text-deep/80">
                <input
                  id="consent"
                  type="checkbox"
                  aria-invalid={errors.consent ? "true" : undefined}
                  aria-describedby={errors.consent ? "consent-error" : undefined}
                  className="mt-1 h-4 w-4 shrink-0 accent-brown"
                  {...register("consent")}
                />
                <span>{tForm("consent")}</span>
              </label>
              {errors.consent && (
                <p id="consent-error" className="mt-1.5 text-[12px] text-clay">
                  {copy.consent}
                </p>
              )}
            </div>

            {status === "error" && (
              <p role="alert" className="text-[14px] text-clay">
                {copy.error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex items-center justify-center gap-2 self-start border border-brown px-8 py-3.5 text-[11px] uppercase tracking-[0.16em] text-brown transition-colors duration-500 ease-out hover:bg-brown hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" && (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden />
              )}
              {status === "submitting" ? copy.sending : tForm("submit")}
            </button>
          </form>
        )}
      </motion.div>

      {/* Direct channels */}
      <motion.aside
        variants={item}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="flex flex-col gap-5 lg:pt-2"
      >
        {WHATSAPP && (
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 self-start border border-brown px-7 py-3.5 text-[11px] uppercase tracking-[0.16em] text-brown transition-colors duration-500 ease-out hover:bg-brown hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            {t("whatsapp")}
          </a>
        )}

        {CONTACT_EMAIL && (
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-3 self-start text-[14px] text-deep/80 transition-colors duration-300 hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <Mail className="h-4 w-4 text-clay" strokeWidth={1.5} aria-hidden />
            <span>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-brown">
                {t("emailLabel")}
              </span>
              {CONTACT_EMAIL}
            </span>
          </a>
        )}
      </motion.aside>
    </div>
  );
}
