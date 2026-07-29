import { getTranslations, getLocale } from "next-intl/server";
import { getActiveFaqItems } from "@/lib/homepage-content";
import { getLocalized } from "@/lib/get-localized";
import { Reveal } from "@/components/ui/reveal";
import { FaqAccordion } from "./faq-accordion";

export async function Faq() {
  const [items, t, locale] = await Promise.all([getActiveFaqItems(), getTranslations("home"), getLocale()]);

  if (items.length === 0) return null;

  const localized = items.map((item) => ({
    id: item.id,
    question: getLocalized(item.question as Record<string, string>, locale),
    answer: getLocalized(item.answer as Record<string, string>, locale),
  }));

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {t("faqTitle")}
      </h2>
      <Reveal>
        <FaqAccordion items={localized} />
      </Reveal>
    </section>
  );
}
