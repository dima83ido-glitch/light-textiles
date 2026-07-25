import type { Metadata } from "next";
import { RotateCcw, ShieldCheck, Wrench } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Delivery } from "@/components/home/delivery";
import { PageHero } from "@/components/ui/page-hero";
import { Card } from "@/components/ui/card";
import { getAlternates } from "@/lib/seo";

const returnsIcons = [RotateCcw, Wrench, ShieldCheck];

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
    title: `${navT("delivery")} — Light Textiles`,
    description: pagesT("deliveryHeroSubtitle"),
    alternates: getAlternates("/delivery", locale),
  };
}

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [navT, pagesT] = await Promise.all([getTranslations("nav"), getTranslations("pages")]);
  const returnsItems = pagesT.raw("returnsItems") as { title: string; text: string }[];

  return (
    <>
      <PageHero title={navT("delivery")} subtitle={pagesT("deliveryHeroSubtitle")} />
      <Delivery />

      <section id="returns" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          {pagesT("returnsTitle")}
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {returnsItems.map((item, i) => {
            const Icon = returnsIcons[i % returnsIcons.length];
            return (
              <Card key={item.title} hoverLift>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)]">
                  <Icon className="h-5.5 w-5.5" strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-[var(--color-ink)]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">{item.text}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
