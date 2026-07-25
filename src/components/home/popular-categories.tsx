import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { store, countProductsInCategory } from "@/lib/demo-store";
import { getLocalized } from "@/lib/get-localized";
import { CategoryCardMotion } from "./category-card-motion";

export async function PopularCategories() {
  const categories = [...store.categories]
    .filter((c) => c.isVisible && c.parentId !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      image: c.image,
      _count: { products: countProductsInCategory(c.id) },
    }));
  const [t, tCommon, locale] = await Promise.all([getTranslations("home"), getTranslations("common"), getLocale()]);

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {t("popularCategoriesTitle")}
      </h2>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category, i) => {
          const name = getLocalized(category.name as Record<string, string>, locale);
          return (
            <CategoryCardMotion key={category.id} index={i}>
              <Link
                href={`/catalog/${category.slug}`}
                className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lifted)]"
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                <div className="relative">
                  <p className="text-sm font-semibold text-white drop-shadow-sm">{name}</p>
                  <p className="text-xs text-white/80">
                    {tCommon("itemsCount", { count: category._count.products })}
                  </p>
                </div>
              </Link>
            </CategoryCardMotion>
          );
        })}
      </div>
    </section>
  );
}
