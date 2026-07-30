import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getProductBySlug, productCardSelect, toProductCardData } from "@/lib/products";
import { getLocalized } from "@/lib/get-localized";
import { getAlternates, OG_LOCALE } from "@/lib/seo";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductCard } from "@/components/product/product-card";
import { StockByWarehouse } from "@/components/product/stock-by-warehouse";

async function getProduct(slug: string) {
  return getProductBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const name = getLocalized(product.name as Record<string, string>, locale);
  const description = product.description
    ? getLocalized(product.description as Record<string, string>, locale)
    : undefined;
  const alternates = getAlternates(`/product/${slug}`, locale);

  return {
    title: `${name} — Light Textiles`,
    description: description?.slice(0, 160),
    alternates,
    openGraph: {
      // Next.js replaces (not merges) the root layout's openGraph object whenever a page
      // defines its own, so siteName/type/locale are repeated here to keep them present.
      siteName: "Light Textiles",
      type: "website",
      locale: OG_LOCALE[locale] ?? OG_LOCALE.uk,
      url: alternates.canonical,
      title: name,
      description: description?.slice(0, 160),
      images: product.images[0] ? [product.images[0].url] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: description?.slice(0, 160),
      images: product.images[0] ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [t, tNav] = await Promise.all([getTranslations("product"), getTranslations("nav")]);

  const product = await getProduct(slug);
  if (!product) notFound();

  const name = getLocalized(product.name as Record<string, string>, locale);
  const description = product.description
    ? getLocalized(product.description as Record<string, string>, locale)
    : null;
  const categoryName = getLocalized(product.category.name as Record<string, string>, locale);

  const similar = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isVisible: true, id: { not: product.id } },
    take: 4,
    select: productCardSelect,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: product.images.map((i) => i.url),
    description: description ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: product.variants[0]?.price ?? product.basePrice,
      availability:
        product.availability === "IN_STOCK" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* JSON.stringify doesn't escape "<" — without this, a "</script>" inside admin-entered
          product content would break out of the script tag and inject arbitrary HTML/JS. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--color-ink-soft)]">
        <Link href="/" className="hover:text-[var(--color-accent-strong)]">
          {tNav("home")}
        </Link>
        <span>/</span>
        <Link href={`/catalog/${product.category.slug}`} className="hover:text-[var(--color-accent-strong)]">
          {categoryName}
        </Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">{name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images.map((i) => i.url)} name={name} />

        <div>
          <h1 className="mb-6 text-2xl font-semibold leading-tight tracking-tight text-[var(--color-ink)] sm:text-3xl">
            {name}
          </h1>

          <ProductPurchasePanel
            productId={product.id}
            slug={product.slug}
            name={name}
            image={product.images[0]?.url}
            basePrice={product.basePrice}
            availability={product.availability}
            variants={product.variants.map((v) => ({ id: v.id, name: v.name, price: v.price }))}
          />

          <StockByWarehouse
            stockLevels={product.stockLevels.map((s) => ({ warehouse: s.warehouse, quantity: s.quantity }))}
            locale={locale}
          />

          {description && (
            <div className="mt-10 border-t border-[var(--color-border)] pt-8">
              <h2 className="mb-3 text-base font-semibold text-[var(--color-ink)]">{t("description")}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-ink-muted)]">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{t("similar")}</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={toProductCardData(p, locale)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
