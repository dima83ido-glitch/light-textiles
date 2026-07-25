import type { Metadata } from "next";
import { ClipboardList, MessageSquareText, Truck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/home/contact-form";
import { PageHero } from "@/components/ui/page-hero";
import { Card } from "@/components/ui/card";
import { getAlternates } from "@/lib/seo";

const stepIcons = [ClipboardList, MessageSquareText, Truck];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: `${t("customOrderTitle")} — Light Textiles`,
    description: t("customOrderSubtitle"),
    alternates: getAlternates("/custom-order", locale),
  };
}

export default async function CustomOrderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages");
  const steps = t.raw("customOrderSteps") as { title: string; text: string }[];

  return (
    <>
      <PageHero title={t("customOrderTitle")} subtitle={t("customOrderSubtitle")} />

      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = stepIcons[i % stepIcons.length];
            return (
              <Card key={step.title} hoverLift>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)]">
                  <Icon className="h-5.5 w-5.5" strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-[var(--color-ink)]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">{step.text}</p>
              </Card>
            );
          })}
        </div>

        <div className="mx-auto max-w-2xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-lifted)] sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-[var(--color-ink)]">{t("customOrderFormTitle")}</h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
