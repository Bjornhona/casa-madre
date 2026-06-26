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
    ],
  },
};

export default createNextIntlPlugin()(nextConfig);
