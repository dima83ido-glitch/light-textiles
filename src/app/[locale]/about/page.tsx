import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { About } from "@/components/home/about";
import { PageHero } from "@/components/ui/page-hero";
import { getAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [navT, pagesT] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "pages" }),
  ]);
  return {
    title: `${navT("about")} — Light Textiles`,
    description: pagesT("aboutHeroSubtitle"),
    alternates: getAlternates("/about", locale),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [navT, pagesT] = await Promise.all([getTranslations("nav"), getTranslations("pages")]);

  return (
    <>
      <PageHero title={navT("about")} subtitle={pagesT("aboutHeroSubtitle")} />
      <About />
    </>
  );
}
