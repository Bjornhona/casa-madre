"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import {
  ACCESS_COOKIE,
  ACCESS_TTL_SECONDS,
  accessCookieOptions,
  createAccessToken,
  verifyPreviewPassword,
} from "@/lib/preview-auth";
import { consumeAttempt, resetAttempts } from "@/lib/rate-limit";

/**
 * `null` = nothing submitted yet. Every wrong password produces the same
 * `"invalid"` — the form must never distinguish "no password configured" from
 * "wrong password" to a visitor. `"throttled"` and `"unconfigured"` are safe
 * to surface: neither says anything about the secret, and both would otherwise
 * strand a team member on a silently failing form.
 */
export type AccessState = { error: "invalid" | "throttled" | "unconfigured" | null };

const ATTEMPT_LIMIT = 8;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

async function clientKey(): Promise<string> {
  const headerList = await headers();
  // x-forwarded-for is a client-controlled header, but on Vercel the platform
  // overwrites it, so the left-most entry is the real peer. Falls back to a
  // shared bucket rather than to "no limit" when it's absent.
  const forwarded = headerList.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/** Randomised so the delay itself can't be used to time the comparison. */
function failureDelay(): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, 400 + Math.floor(Math.random() * 500)),
  );
}

export async function submitAccess(
  _previous: AccessState,
  formData: FormData,
): Promise<AccessState> {
  const submitted = formData.get("password");
  const requested = formData.get("locale");
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const { allowed } = consumeAttempt(await clientKey(), {
    limit: ATTEMPT_LIMIT,
    windowMs: ATTEMPT_WINDOW_MS,
  });
  if (!allowed) {
    await failureDelay();
    return { error: "throttled" };
  }

  if (typeof submitted !== "string" || !(await verifyPreviewPassword(submitted))) {
    await failureDelay();
    return { error: "invalid" };
  }

  const token = await createAccessToken();
  if (!token) {
    // PREVIEW_SECRET missing — we can't issue a cookie the proxy would accept,
    // so say so rather than "logging in" to a redirect loop.
    return { error: "unconfigured" };
  }

  resetAttempts(await clientKey());

  const store = await cookies();
  store.set(ACCESS_COOKIE, token, {
    ...accessCookieOptions(),
    maxAge: ACCESS_TTL_SECONDS,
  });

  // Outside the checks above: redirect() signals by throwing.
  redirect(`/${locale}`);
}
