"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Mail, MessageCircle, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { EASE } from "@/lib/motion";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;

// Reveal once the hero is scrolled past, so the button never covers it on load.
const SHOW_AFTER = 400;

/**
 * One calm concierge button, mounted once globally in the [locale] layout.
 *
 * Collapsed it's a single round button; tapping it expands to reveal WhatsApp +
 * Contacto, and a session-only dismiss. It appears after ~400px of scroll, hides
 * on /contacto (the form is right there), and sits at z-10 so the nav overlay
 * menu (z-20) covers it cleanly when open.
 */
export function FloatingContact() {
  const t = useTranslations("floatingContact");
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false); // in-memory: resets on reload
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While open: close on outside pointer / Escape (Escape returns focus to the
  // toggle), and move focus into the menu for keyboard + screen-reader users.
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onPointer = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The form is already on the contact page; dismissal hides it for the session.
  if (dismissed || pathname === "/contacto") return null;

  const actionClass =
    "inline-flex items-center gap-2.5 rounded-full border border-line bg-cream px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-brown shadow-soft transition-[transform,background-color,color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-brown hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={containerRef}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: reduce ? 0.2 : 0.5, ease: EASE }}
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
          className="fixed right-4 z-10 flex flex-col items-end gap-3 sm:right-6"
        >
          <AnimatePresence>
            {open && (
              <motion.div
                id="floating-contact-menu"
                ref={menuRef}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: reduce ? 0.15 : 0.35, ease: EASE }}
                className="flex flex-col items-end gap-3"
              >
                {WHATSAPP && (
                  <a
                    href={`https://wa.me/${WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={actionClass}
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    {t("whatsapp")}
                  </a>
                )}
                <Link href="/contacto" onClick={() => setOpen(false)} className={actionClass}>
                  <Mail className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  {t("contact")}
                </Link>
                {/* <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-muted transition-colors duration-300 hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
                >
                  {t("dismiss")}
                </button> */}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="floating-contact-menu"
            aria-label={open ? t("closeLabel") : t("openLabel")}
            onClick={() => setOpen((o) => !o)}
            className="grid h-14 w-14 place-items-center self-end rounded-full bg-clay text-cream shadow-soft transition-[transform,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "open"}
                initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: -30 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 30 }}
                transition={{ duration: reduce ? 0.1 : 0.2, ease: "easeOut" }}
              >
                {open ? (
                  <X className="h-6 w-6" strokeWidth={1.5} />
                ) : (
                  <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
