"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Mail, MessageCircle } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { EASE } from "@/lib/motion";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;

// Reveal once the hero is scrolled past, so the button never covers it on load.
const SHOW_AFTER = 400;

/**
 * Quiet concierge button, mounted once globally in the [locale] layout. Fades in
 * after scrolling, links to the contact page + WhatsApp, and stays out of the
 * way: hidden on /contacto (the form is right there), and sitting at z-10 so the
 * nav overlay menu (z-20) covers it cleanly when open.
 */
export function FloatingContact() {
  const t = useTranslations("floatingContact");
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The form is already on the contact page — no need for the shortcut there.
  if (pathname === "/contacto") return null;

  // On the home page the corner also hosts the ambient OceanSound toggle
  // (bottom-6 right-6); lift the stack so the two never overlap.
  const isHome = pathname === "/";
  const bottom = `calc(env(safe-area-inset-bottom, 0px) + ${
    isHome ? "5.5rem" : "1.5rem"
  })`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: reduce ? 0.2 : 0.5, ease: EASE }}
          style={{ bottom }}
          className="fixed right-4 z-10 flex flex-col items-end gap-3 sm:right-6"
        >
          <Link
            href="/contacto"
            aria-label={t("contactAria")}
            className="group inline-flex items-center gap-2.5 rounded-full border border-line bg-cream px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-brown shadow-soft transition-[transform,background-color,color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-brown hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            {t("contact")}
          </Link>

          {WHATSAPP && (
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("whatsappAria")}
              className="grid h-12 w-12 place-items-center self-end rounded-full bg-clay text-cream shadow-soft transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:bg-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
