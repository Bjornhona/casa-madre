import { NextResponse, type NextRequest } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { ACCESS_COOKIE, accessCookieOptions } from "@/lib/preview-auth";

/**
 * Clears the team-access cookie and sends the visitor home — which, while
 * NEXT_PUBLIC_COMING_SOON is on, the proxy will show as the holding page.
 *
 * Lives under /api so it stays outside the gate's matcher. GET is accepted for
 * convenience (it's a link people paste): the worst a forged request can do is
 * log someone out, and the cookie grants no authority beyond seeing the site.
 */
function clearAccess(request: NextRequest): NextResponse {
  const requested = request.nextUrl.searchParams.get("locale");
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const response = NextResponse.redirect(new URL(`/${locale}`, request.url));
  // Same attributes it was set with, or the browser keeps the original cookie.
  response.cookies.set(ACCESS_COOKIE, "", {
    ...accessCookieOptions(),
    maxAge: 0,
  });

  return response;
}

export function GET(request: NextRequest) {
  return clearAccess(request);
}

export function POST(request: NextRequest) {
  return clearAccess(request);
}
