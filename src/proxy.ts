import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { ACCESS_COOKIE, verifyAccessToken } from "./lib/preview-auth";

const intlMiddleware = createMiddleware(routing);

// Holding-page toggle. When "true", every public route is rewritten to the
// on-brand coming-soon page unless the visitor carries a valid team-access
// cookie. /studio, /api and static assets are already excluded by
// `config.matcher` below, so the CMS and forms stay reachable either way.
const COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === "true";

// First path segment (after the optional locale) of the two routes that must
// stay reachable while the gate is on: the holding page itself, and the login
// page — gating the login would lock out the only way through the gate.
const UNGATED = new Set(["acceso", "coming-soon"]);

function segmentsAfterLocale(pathname: string): string[] {
  const segments = pathname.split("/").filter(Boolean);
  const isLocale = routing.locales.includes(
    segments[0] as (typeof routing.locales)[number],
  );
  return isLocale ? segments.slice(1) : segments;
}

function localeOf(pathname: string): string {
  const segment = pathname.split("/")[1];
  return routing.locales.includes(segment as (typeof routing.locales)[number])
    ? segment
    : routing.defaultLocale;
}

export default async function proxy(request: NextRequest) {
  if (COMING_SOON) {
    const { pathname } = request.nextUrl;
    const [first] = segmentsAfterLocale(pathname);

    if (!UNGATED.has(first ?? "")) {
      const token = request.cookies.get(ACCESS_COOKIE)?.value;

      // Any failure — no cookie, tampered cookie, expired token, or a rotated
      // PREVIEW_SECRET that no longer verifies old ones — falls through to the
      // holding page. Rewrite, not redirect, so the URL stays put.
      if (!(await verifyAccessToken(token))) {
        const url = request.nextUrl.clone();
        url.pathname = `/${localeOf(pathname)}/coming-soon`;
        return NextResponse.rewrite(url);
      }
    }
  }

  // Valid cookie, ungated route, or gate off: normal locale routing.
  return intlMiddleware(request);
}

// Exclude API, Next internals, root metadata routes (apple-icon, icon,
// opengraph-image, sitemap, robots, manifest), the embedded Studio and any
// file with an extension so they are not redirected through the locale prefix
// (and stay reachable while the holding page is on).
export const config = {
  matcher: [
    "/((?!api|_next|_vercel|apple-icon|icon|opengraph-image|sitemap|robots|manifest|studio|.*\\..*).*)",
  ],
};
