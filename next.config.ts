import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Route renamed /nosotras → /about. Permanently redirect the old localized
  // paths so existing links / search results don't 404.
  async redirects() {
    return [
      {
        source: "/:locale/nosotras",
        destination: "/:locale/about",
        permanent: true,
      },
      {
        source: "/:locale/nosotras/:path*",
        destination: "/:locale/about/:path*",
        permanent: true,
      },
      // Route renamed /servicios → /services (overview + the six detail pages).
      {
        source: "/:locale/servicios",
        destination: "/:locale/services",
        permanent: true,
      },
      {
        source: "/:locale/servicios/:path*",
        destination: "/:locale/services/:path*",
        permanent: true,
      },
      // Spanish route segments anglicized (child slugs unchanged in Sanity).
      {
        source: "/:locale/propiedades",
        destination: "/:locale/properties",
        permanent: true,
      },
      {
        source: "/:locale/propiedades/:path*",
        destination: "/:locale/properties/:path*",
        permanent: true,
      },
      {
        source: "/:locale/barrios",
        destination: "/:locale/neighbourhoods",
        permanent: true,
      },
      {
        source: "/:locale/barrios/:path*",
        destination: "/:locale/neighbourhoods/:path*",
        permanent: true,
      },
      {
        source: "/:locale/contacto",
        destination: "/:locale/contact",
        permanent: true,
      },
      {
        source: "/:locale/privacidad",
        destination: "/:locale/privacy",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      // Journal video poster frames. Without this, next/image rejects the
      // auto-frame fallback on JournalCard at runtime.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default createNextIntlPlugin()(nextConfig);
