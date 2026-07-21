import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategoryBySlug, getProductsForCategoryIds, toProductCardData, type CatalogSort } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { CatalogPagination } from "@/components/catalog/pagination";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  const name = (category.name as Record<string, string>)[locale] ?? (category.name as Record<string, string>).uk;
  return {
    title: `${name} — Light Textiles`,
    description: `${name}: каталог товарів Light Textiles. Купити з доставкою по всій Україні.`,
  };
}

export default async function CatalogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryIds =
    category.children.length > 0 ? category.children.map((c) => c.id) : [category.id];

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const sort = (sp.sort as CatalogSort) ?? "newest";
  const minPrice = sp.min ? parseInt(sp.min, 10) : undefined;
  const maxPrice = sp.max ? parseInt(sp.max, 10) : undefined;

  const { items, total, pageCount } = await getProductsForCategoryIds(categoryIds, {
    sort,
    minPrice,
    maxPrice,
    page,
  });

  const name = (category.name as Record<string, string>)[locale] ?? (category.name as Record<string, string>).uk;
  const parentName = category.parent
    ? (category.parent.name as Record<string, string>)[locale] ?? (category.parent.name as Record<string, string>).uk
    : null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
        <Link href="/" className="hover:text-[var(--color-accent-strong)]">
          Головна
        </Link>
        <span>/</span>
        {parentName && category.parent && (
          <>
            <Link href={`/catalog/${category.parent.slug}`} className="hover:text-[var(--color-accent-strong)]">
              {parentName}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[var(--color-ink)]">{name}</span>
      </nav>

      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {name}
      </h1>

      {category.children.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {category.children.map((child) => {
            const childName = (child.name as Record<string, string>)[locale] ?? (child.name as Record<string, string>).uk;
            return (
              <Link
                key={child.id}
                href={`/catalog/${child.slug}`}
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-accent-strong)]"
              >
                {childName}
              </Link>
            );
          })}
        </div>
      )}

      <CatalogToolbar total={total} />

      {items.length === 0 ? (
        <p className="py-20 text-center text-[var(--color-ink-muted)]">
          У цій категорії поки немає товарів.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={toProductCardData(product, locale)} />
          ))}
        </div>
      )}

      <CatalogPagination
        currentPage={page}
        pageCount={pageCount}
        basePath={`/catalog/${slug}`}
        searchParams={sp}
      />
    </div>
  );
}
