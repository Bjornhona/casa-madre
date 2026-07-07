import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Holding-page toggle. When "true", every public route is rewritten to the
// on-brand coming-soon page. /studio, /api and static assets are already
// excluded by `config.matcher` below, so the CMS and forms stay reachable.
const COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === "true";

function localeOf(pathname: string): string {
  const segment = pathname.split("/")[1];
  return routing.locales.includes(segment as (typeof routing.locales)[number])
    ? segment
    : routing.defaultLocale;
}

export default function proxy(request: NextRequest) {
  if (COMING_SOON) {
    const { pathname } = request.nextUrl;
    // Rewrite (URL stays put) everything except the holding page itself.
    if (!pathname.endsWith("/coming-soon")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${localeOf(pathname)}/coming-soon`;
      return NextResponse.rewrite(url);
    }
  }

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
