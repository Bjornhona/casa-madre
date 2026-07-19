import { Fragment } from "react";
import { Link } from "@/i18n/navigation";
import { SerifHeading } from "@/components/ui/SerifHeading";

/**
 * Presentational template for the legal documents (Aviso Legal, Privacidad,
 * Cookies). Premium-editorial: a compact dark header (so the fixed nav stays
 * legible), then a readable ~65ch prose column with serif section headings,
 * hairline dividers and an owner/controller data block. Content is passed in as
 * structured sections; company data comes from LEGAL_DATA via the calling page.
 */

export type LegalSection = {
  heading?: string;
  /** Body paragraphs. */
  paragraphs?: string[];
  /** Owner / data-controller details (label + value rows from LEGAL_DATA). */
  details?: { label: string; value: string }[];
};

type LegalPageProps = {
  title: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  intro?: string;
  sections: LegalSection[];
  backLabel: string;
};

export function LegalPage({
  title,
  lastUpdatedLabel,
  lastUpdated,
  intro,
  sections,
  backLabel,
}: LegalPageProps) {
  return (
    <article>
      {/* Header — compact dark band, clears the fixed nav and keeps it legible. */}
      <header className="bg-deep px-6 pt-36 pb-14 text-cream sm:px-10 lg:px-12 lg:pt-40">
        <div className="mx-auto w-full max-w-[65ch]">
          <SerifHeading
            as="h1"
            className="text-[36px] leading-[1.05] sm:text-[48px]"
          >
            {title}
          </SerifHeading>
          <p className="mt-5 text-[12px] uppercase tracking-[0.18em] text-cream/55">
            {lastUpdatedLabel}: {lastUpdated}
          </p>
        </div>
      </header>

      {/* Prose */}
      <div className="px-6 py-16 sm:px-10 lg:px-12 lg:py-20">
        <div className="mx-auto w-full max-w-[65ch]">
          {intro && (
            <p className="text-[17px] font-light leading-[1.8] text-deep/85">
              {intro}
            </p>
          )}

          <div className="mt-12 flex flex-col gap-12">
            {sections.map((section, i) => (
              <section
                key={i}
                className={i === 0 && !intro ? "" : "border-t border-line pt-12"}
              >
                {section.heading && (
                  <SerifHeading
                    as="h2"
                    className="text-[24px] leading-[1.15] text-brown sm:text-[28px]"
                  >
                    {section.heading}
                  </SerifHeading>
                )}

                {section.details && (
                  <dl className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-[10rem_1fr]">
                    {section.details.map((row, j) => (
                      <Fragment key={j}>
                        <dt className="text-[12px] uppercase tracking-[0.16em] text-clay sm:pt-1">
                          {row.label}
                        </dt>
                        <dd className="text-[16px] leading-[1.6] text-deep/85 whitespace-pre-line">
                          {row.value}
                        </dd>
                      </Fragment>
                    ))}
                  </dl>
                )}

                {section.paragraphs?.map((paragraph, j) => (
                  <p
                    key={j}
                    className="mt-4 text-[16px] font-light leading-[1.8] text-deep/85"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <div className="mt-16 border-t border-line pt-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-brown transition-opacity duration-300 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
            >
              <span aria-hidden>←</span>
              {backLabel}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
