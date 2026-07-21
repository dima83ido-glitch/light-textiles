import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { Advantages } from "@/components/home/advantages";
import { PopularCategories } from "@/components/home/popular-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { About } from "@/components/home/about";
import { Delivery } from "@/components/home/delivery";
import { Reviews } from "@/components/home/reviews";
import { Faq } from "@/components/home/faq";
import { ContactSection } from "@/components/home/contact-section";

export const metadata: Metadata = {
  title: "Light Textiles — Постільна білизна, рушники та тканини від виробника",
  description:
    "Українське виробництво постільної білизни, рушників та тканин зі 100% бавовни. Власне пошиття за будь-якими розмірами, доставка по всій Україні.",
};

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
