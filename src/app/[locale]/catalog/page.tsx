import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategoryTree } from "@/lib/categories";
import { getLocalized } from "@/lib/get-localized";
import { getAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  return {
    title: `${t("title")} — Light Textiles`,
    description: t("rootMetaDescription"),
    alternates: getAlternates("/catalog", locale),
  };
}

export default async function CatalogRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [groups, t] = await Promise.all([getCategoryTree(), getTranslations("catalog")]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-10 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {t("title")}
      </h1>

      <div className="flex flex-col gap-12">
        {groups.map((group, groupIndex) => (
          <div key={group.id}>
            <h2 className="mb-5 text-xl font-semibold text-[var(--color-ink)]">
              {getLocalized(group.name, locale)}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {group.children.map((child, childIndex) => (
                <Link
                  key={child.id}
                  href={`/catalog/${child.slug}`}
                  className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lifted)]"
                >
                  {child.image && (
                    <Image
                      src={child.image}
                      alt={getLocalized(child.name, locale)}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      priority={groupIndex === 0 && childIndex < 4}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
                  <p className="relative text-sm font-semibold text-white drop-shadow-sm">
                    {getLocalized(child.name, locale)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
