import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import { getLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const golosText = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});

// Every page already appends " — Light Textiles" to its own title manually (see
// src/app/[locale]/**/page.tsx generateMetadata), so this deliberately doesn't set a
// title.template — that would double the suffix. metadataBase is what's actually new
// here: without it, Next can't resolve relative openGraph/twitter image URLs (e.g. the
// product page's product.images[0].url, which is a site-relative /uploads/... path) into
// the absolute URLs that OG/Twitter crawlers require, and falls back to localhost.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Light Textiles",
  description: "Лайт Текстиль — постільна білизна та тканини",
  openGraph: {
    siteName: "Light Textiles",
    type: "website",
    images: [{ url: "/images/hero-fabric.jpg", width: 1200, height: 1500 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

// Sitewide Organization/WebSite structured data — static (no DB read), so it doesn't add
// a query to every single page render (this layout wraps the admin panel too). Kept
// separate from the per-product JSON-LD in product/[slug]/page.tsx, which is dynamic.
const organizationJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Light Textiles",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-mark-1024.png`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Light Textiles",
    url: SITE_URL,
  },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${golosText.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans">
        {/* See product/[slug]/page.tsx for why literal "<" is escaped before injecting. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="light-textiles-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
