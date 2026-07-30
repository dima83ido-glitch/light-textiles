import { routing } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://light-textiles.com.ua";

/** next-intl locale code -> Open Graph locale code (og:locale expects e.g. "en_US", not "en"). */
export const OG_LOCALE: Record<string, string> = {
  uk: "uk_UA",
  en: "en_US",
  ru: "ru_RU",
};

/** Builds hreflang alternates for a locale-agnostic pathname (e.g. "/catalog/double"). */
export function getAlternates(pathname: string, currentLocale: string) {
  const path = pathname === "/" ? "" : pathname;
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    languages[locale] = `${SITE_URL}${prefix}${path}`;
  }
  languages["x-default"] = `${SITE_URL}${path}`;

  return {
    canonical: languages[currentLocale],
    languages,
  };
}
