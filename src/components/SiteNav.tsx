"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { EASE } from "@/lib/motion";

/**
 * Fixed top navigation over the hero. Cream text on a soft top-down scrim.
 * Menu is presentational for this vertical slice (no other sections yet).
 */
export function SiteNav() {
  const t = useTranslations("nav");

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
      className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 text-cream sm:px-10 lg:px-[42px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(43,33,27,0.5),rgba(43,33,27,0))]"
      />

      <button
        type="button"
        className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] transition-opacity duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cream/70"
      >
        <Menu className="h-4 w-4" strokeWidth={1.25} aria-hidden />
        <span className="hidden sm:inline">{t("menu")}</span>
      </button>

      <div className="flex items-center gap-5">
        <LocaleSwitch />
        <a
          href="#contacto"
          className="hidden border border-cream/70 px-6 py-3 text-[11px] uppercase tracking-[0.16em] transition-colors duration-500 hover:bg-cream hover:text-deep focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cream/70 sm:inline-block"
        >
          {t("contact")}
        </a>
      </div>
    </motion.header>
  );
}
