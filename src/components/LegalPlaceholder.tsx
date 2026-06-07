import { Link } from "@/i18n/navigation";

// Client-supplied legal copy lands here before launch (lawyer/gestoría).
// Message provided verbatim by the brief, so it lives inline rather than in the catalog.
const MESSAGE: Record<string, string> = {
  es: "Este contenido estará disponible próximamente.",
  en: "This content will be available shortly.",
};

export function LegalPlaceholder({ locale }: { locale: string }) {
  const message = MESSAGE[locale === "en" ? "en" : "es"];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <Link
        href="/"
        className="font-serif text-[28px] uppercase tracking-[0.22em] text-brown transition-opacity duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
      >
        Casa Madre
      </Link>
      <p className="max-w-[32rem] text-[16px] leading-[1.6] text-muted">
        {message}
      </p>
    </main>
  );
}
