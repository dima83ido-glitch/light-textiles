import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { FaqAccordion } from "./faq-accordion";

export async function Faq() {
  const [items, t, locale] = await Promise.all([
    prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    getTranslations("home"),
    getLocale(),
  ]);

  if (items.length === 0) return null;

  const localized = items.map((item) => ({
    id: item.id,
    question: (item.question as Record<string, string>)[locale] ?? (item.question as Record<string, string>).uk,
    answer: (item.answer as Record<string, string>)[locale] ?? (item.answer as Record<string, string>).uk,
  }));

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {t("faqTitle")}
      </h2>
      <FaqAccordion items={localized} />
    </section>
  );
}
