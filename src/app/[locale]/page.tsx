import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getAlternates } from "@/lib/seo";
import { Hero } from "@/components/home/hero";
import { PromoBanners } from "@/components/home/promo-banners";
import { Advantages } from "@/components/home/advantages";
import { PopularCategories } from "@/components/home/popular-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { About } from "@/components/home/about";
import { Delivery } from "@/components/home/delivery";
import { Reviews } from "@/components/home/reviews";
import { Faq } from "@/components/home/faq";
import { ContactSection } from "@/components/home/contact-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: getAlternates("/", locale),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <PromoBanners />
      <Advantages />
      <PopularCategories />
      <FeaturedProducts />
      <About />
      <Delivery />
      <Reviews />
      <Faq />
      <ContactSection />
    </>
  );
}
