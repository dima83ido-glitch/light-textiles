import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Silences a build-time warning: an unrelated package-lock.json in the parent user
  // directory (C:\Users\User\package-lock.json, outside this repo) makes Next unable to
  // infer the workspace root unambiguously. Pinning it here doesn't touch that file.
  outputFileTracingRoot: __dirname,
  // No X-Powered-By: Next.js header — trivial info-disclosure hardening, on by default otherwise.
  poweredByHeader: false,
  // Dev-only (double-invokes effects/renders to surface side-effect bugs); no effect on
  // the production build/runtime. Explicit here instead of relying on Next's default.
  reactStrictMode: true,
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
