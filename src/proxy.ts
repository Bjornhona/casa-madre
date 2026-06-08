import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// Exclude API, Next internals, root metadata routes (apple-icon, icon,
// opengraph-image, sitemap, robots, manifest) and any file with an extension
// so they are not redirected through the locale prefix.
export const config = {
  matcher: [
    "/((?!api|_next|_vercel|apple-icon|icon|opengraph-image|sitemap|robots|manifest|studio|.*\\..*).*)",
  ],
};
