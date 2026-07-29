import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategoryBySlug, getProductsForCategoryIds, toProductCardData, type CatalogSort } from "@/lib/products";
import { getLocalized } from "@/lib/get-localized";
import { getAlternates } from "@/lib/seo";
import { ProductCard } from "@/components/product/product-card";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { CatalogPagination } from "@/components/catalog/pagination";
import { buttonClass } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  const name = getLocalized(category.name as Record<string, string>, locale);
  const t = await getTranslations({ locale, namespace: "catalog" });
  return {
    title: `${name} — Light Textiles`,
    description: t("categoryMetaDescription", { name }),
    alternates: getAlternates(`/catalog/${slug}`, locale),
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
  const [tNav, tCatalog] = await Promise.all([getTranslations("nav"), getTranslations("catalog")]);

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

  const name = getLocalized(category.name as Record<string, string>, locale);
  const parentName = category.parent ? getLocalized(category.parent.name as Record<string, string>, locale) : null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
        <Link href="/" className="hover:text-[var(--color-accent-strong)]">
          {tNav("home")}
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
            const childName = getLocalized(child.name as Record<string, string>, locale);
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
        <div className="flex flex-col items-center gap-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)]">
            <PackageSearch className="h-7 w-7" />
          </div>
          <p className="text-[var(--color-ink-muted)]">{tCatalog("empty")}</p>
          <Link href="/catalog" className={buttonClass()}>
            {tCatalog("title")}
          </Link>
        </div>
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
