"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { EASE, fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Fixed top navigation, plus a full-screen overlay menu. The wordmark (home),
 * ES/EN switch and Contacto link stay visible in the bar at all times; the Menú
 * button toggles a dark-brown overlay listing the site's real routes.
 */

// Menu items, in order. Labels/subtitles come from `nav.items.*`; `href` is the
// locale-agnostic path handed to next-intl's <Link>, which adds the locale.
const ROUTES = [
  { key: "nosotras", href: "/about" },
  { key: "servicios", href: "/services" },
  { key: "barrios", href: "/neighbourhoods" },
  { key: "propiedades", href: "/properties" },
  { key: "journal", href: "/journal" },
  { key: "contacto", href: "/contact" },
] as const;

export function SiteNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const container = staggerContainer(reduce, 0.05);
  const item = fadeUp(reduce, { y: 18, duration: 0.55 });

  // A route is active when the pathname (locale already stripped by next-intl)
  // matches the item, or sits beneath it (e.g. /properties/[slug]).
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Lock body scroll while the overlay is open; restore the previous value.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape and return focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Move focus into the dialog when it opens for screen-reader users.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 text-cream sm:px-10 lg:px-[42px]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(43,33,27,0.8),rgba(43,33,27,0))]"
        />

        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls="nav-overlay"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] transition-opacity duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cream/70"
        >
          {open ? (
            <X className="h-4 w-4" strokeWidth={1.25} aria-hidden />
          ) : (
            <Menu className="h-4 w-4" strokeWidth={1.25} aria-hidden />
          )}
          <span className="hidden sm:inline">{open ? t("close") : t("menu")}</span>
        </button>

        {/* Wordmark — returns to the home page from any route. */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[15px] uppercase tracking-[0.3em] text-cream transition-opacity duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cream/70"
        >
          Casa Madre
        </Link>

        <div className="flex items-center gap-5">
          <LocaleSwitch />
          <Link
            href="/contact"
            className="hidden border border-cream/70 px-6 py-3 text-[11px] uppercase tracking-[0.16em] transition-colors duration-500 hover:bg-cream hover:text-deep focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cream/70 sm:inline-block"
          >
            {t("contact")}
          </Link>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="nav-overlay"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0.2 : 0.5, ease: EASE }}
            className="fixed inset-0 z-20 bg-deep text-cream outline-none"
          >
            <div className="flex h-full flex-col overflow-y-auto px-6 pt-24 pb-10 sm:px-10 lg:px-[42px]">
              <nav
                aria-label={t("menu")}
                className="flex flex-1 flex-col justify-center"
              >
                <motion.ul
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-1 sm:gap-2"
                >
                  {ROUTES.map(({ key, href }) => {
                    const active = isActive(href);
                    return (
                      <motion.li key={key} variants={item}>
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className="group flex w-fit items-baseline gap-4 py-2 outline-none sm:gap-6"
                        >
                          <span
                            className={`font-serif text-[24px] leading-[1.04] tracking-[-0.025em] decoration-1 underline-offset-[10px] transition-all duration-500 sm:text-[36px] lg:text-[48px] ${
                              active
                                ? "text-cream underline decoration-clay"
                                : "text-cream/85 decoration-cream/30 group-hover:text-cream group-hover:underline group-focus-visible:text-cream group-focus-visible:underline"
                            }`}
                          >
                            {t(`items.${key}.label`)}
                          </span>
                          <span className="hidden text-[11px] uppercase tracking-[0.2em] text-cream/40 transition-colors duration-500 group-hover:text-cream/65 sm:inline">
                            {t(`items.${key}.subtitle`)}
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </nav>

              <div className="mt-10 flex items-center justify-between border-t border-cream/15 pt-6">
                <LocaleSwitch />
                <span className="hidden font-serif text-[14px] tracking-[-0.02em] text-cream/40 sm:inline">
                  Casa Madre · Barcelona
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
