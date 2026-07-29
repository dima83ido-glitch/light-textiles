import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    optimizePackageImports: ["framer-motion"],
  },
  images: {
    // AVIF first (smaller than the default webp-only on photographic images, sharp already
    // does the encoding), browsers that don't support it get webp automatically.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "light-textiles.com.ua",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
