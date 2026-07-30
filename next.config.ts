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
  // No CSP here deliberately — next-themes' flash-of-wrong-theme-prevention script and
  // every Framer Motion animation in this app both rely on inline script/style that a
  // strict CSP would need 'unsafe-inline' (or a nonce pipeline this app doesn't have) to
  // allow, and getting that wrong on a live storefront is a worse outcome than shipping
  // without one for now. See DEVELOPER_HANDBOOK.md for the follow-up recommendation.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // Uploaded filenames are `${Date.now()}-${random}${ext}` (src/lib/upload.ts) —
        // never reused/overwritten in place, so a given URL's content is permanently
        // immutable and safe to cache for a year (deletion just 404s afterward, same
        // trade-off any CDN makes).
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
