import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { toProductCardData } from "@/lib/products";
import { getLocalized } from "@/lib/get-localized";
import { getAlternates } from "@/lib/seo";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductCard } from "@/components/product/product-card";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isVisible: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
  });
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

  return {
    title: `${name} — Light Textiles`,
    description: description?.slice(0, 160),
    alternates: getAlternates(`/product/${slug}`, locale),
    openGraph: {
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
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { orderBy: { price: "asc" }, take: 1 },
    },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
