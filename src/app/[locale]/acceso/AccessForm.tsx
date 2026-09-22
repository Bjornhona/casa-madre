"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { ctaClass } from "@/components/ui/cta-styles";
import { restrainedAnimation } from "@/lib/motion";
import { submitAccess, type AccessState } from "./actions";

const INITIAL: AccessState = { error: null };

export function AccessForm() {
  const t = useTranslations("access");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [state, formAction, pending] = useActionState(submitAccess, INITIAL);

  const message = state.error ? t(state.error) : null;

  return (
    <motion.div
      variants={restrainedAnimation(reduce)}
      initial="hidden"
      animate="show"
      className="w-full max-w-[380px] text-center"
    >
      <Kicker>{t("kicker")}</Kicker>
      <SerifHeading as="h1" className="mt-4 text-[30px] leading-[1.12] text-deep">
        {t("title")}
      </SerifHeading>
      <p className="mt-4 text-[14px] font-light leading-[1.7] text-muted">
        {t("subtitle")}
      </p>

      <form action={formAction} className="mt-10 flex flex-col items-stretch">
        <input type="hidden" name="locale" value={locale} />

        <label
          htmlFor="access-password"
          className="text-left text-[11px] uppercase tracking-[0.16em] text-muted"
        >
          {t("passwordLabel")}
        </label>
        <input
          id="access-password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          aria-describedby={message ? "access-error" : undefined}
          aria-invalid={state.error === "invalid" || undefined}
          className="mt-2 w-full border-b border-line bg-transparent py-3 text-center font-serif text-[20px] text-deep transition-colors duration-500 ease-out placeholder:text-muted/50 focus:border-brown focus:outline-none"
        />

        {/* Reserved height so the layout doesn't jump when the error appears. */}
        <p
          id="access-error"
          role="status"
          aria-live="polite"
          // text-clay, not text-terracotta: terracotta on ivory is ~3.7:1,
          // under AA for 12px. Clay clears 4.5:1 and stays in palette.
          className="mt-4 min-h-[1.25rem] text-[12px] tracking-[0.04em] text-clay"
        >
          {message}
        </p>

        <button
          type="submit"
          disabled={pending}
          // self-center: the form stretches its children, which would blow the
          // CTA out to full width and lose its locked proportions.
          className={ctaClass(
            "onLight",
            "mt-4 self-center disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>
    </motion.div>
  );
}
