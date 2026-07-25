import type { MetadataRoute } from "next";
import { store } from "@/lib/demo-store";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";

function localizedUrl(path: string, locale: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${path}`;
}

function alternates(path: string) {
  return Object.fromEntries(routing.locales.map((locale) => [locale, localizedUrl(path, locale)]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = store.products.filter((p) => p.isVisible).map((p) => ({ slug: p.slug, updatedAt: p.updatedAt }));
  const categories = store.categories
    .filter((c) => c.isVisible)
    .map((c) => ({ slug: c.slug, updatedAt: c.updatedAt }));

  const staticPaths = ["/", "/catalog", "/about", "/delivery", "/custom-order", "/contacts"];

  const entries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(path, locale),
      alternates: { languages: alternates(path) },
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
  );

  for (const category of categories) {
    const path = `/catalog/${category.slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(path, locale),
        alternates: { languages: alternates(path) },
        lastModified: category.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  for (const product of products) {
    const path = `/product/${product.slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(path, locale),
        alternates: { languages: alternates(path) },
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
