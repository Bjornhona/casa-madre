import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { LEGAL_DATA } from "@/lib/legal-data";
import { sanityFetch } from "@/sanity/lib/live";
import { ESTABLISHMENT_AICAT_QUERY } from "@/sanity/lib/queries";

const LEGAL_LINKS = [
  { href: "/legal", key: "notice" },
  { href: "/privacy", key: "privacy" },
  { href: "/cookies", key: "cookies" },
] as const;

/**
 * Credentials mark — a two-panel composite, shown whole and unaltered.
 *
 * Right panel: the Generalitat's official distintivo for the Registre d'Agents
 * Immobiliaris de Catalunya, AICAT 14044. That is the *establishment's*
 * registration, held by Evelyn as the registered agent, and it is meant to be
 * displayed — which is why the footer carries a firm-level AICAT while /legal
 * and the contact cards separately list each agent's individual number. Left
 * panel: ANPIFF membership, a voluntary trade association.
 *
 * Rendered at a fraction of the 934×203 original so it reads as a credentials
 * mark rather than a banner; the ratio is preserved, and passing both
 * dimensions reserves the box before load so nothing shifts.
 */
const BADGE_WIDTH = 280;
const BADGE_HEIGHT = 61;

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();
  const npiff = LEGAL_DATA.credentials.npiff;

  // Read from the agent records, so the number on the mark and the number in
  // the Studio can never drift apart. Every page renders the footer, so this is
  // a per-page query — trivial, and deduped within a request.
  const { data: aicat } = await sanityFetch({ query: ESTABLISHMENT_AICAT_QUERY });

  // Each credential renders only if we actually have its number; the separator
  // is applied between whatever survives, so there is never a dangling "·".
  const credentials = [
    aicat && t("credentials.aicat", { number: aicat }),
    npiff && t("credentials.anpiff", { number: npiff }),
  ].filter(Boolean);

  return (
    <footer className="bg-cream border-t border-line px-6 py-14 text-muted sm:px-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-6">
            <p className="font-serif text-[20px] tracking-[-0.02em] text-brown">
              {t("tagline")}
            </p>

            <div className="flex flex-col gap-2">
              <Image
                src="/asociada-anpiff.jpeg"
                alt={t("credentials.alt")}
                width={BADGE_WIDTH}
                height={BADGE_HEIGHT}
                className="h-auto w-[280px] max-w-full"
              />
              {/* Both numbers repeated as real text: at this width the print on
                  the mark itself is too small to read. */}
              {credentials.length > 0 && (
                <p className="text-[12px] uppercase tracking-[0.14em]">
                  {credentials.join(" · ")}
                </p>
              )}
            </div>
          </div>

          <nav
            aria-label={t("legal.notice")}
            className="flex flex-wrap gap-x-8 gap-y-3 text-[12px] uppercase tracking-[0.14em]"
          >
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-300 hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
              >
                {t(`legal.${link.key}`)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-6 border-t border-line pt-8 text-[12px] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 tracking-[0.02em]">
            <p>© {year} Casa Madre. {t("rights")}</p>
            <p>
              {t.rich("credit", {
                link: (chunks) => (
                  <a
                    href="https://asaeriksson.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 transition-colors duration-300 hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>
          <LocaleSwitch />
        </div>
      </div>
    </footer>
  );
}
