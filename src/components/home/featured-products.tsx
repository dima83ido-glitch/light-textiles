import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { productCardSelect, toProductCardData } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";

export async function FeaturedProducts() {
  const [products, t, locale] = await Promise.all([
    prisma.product.findMany({
      where: { isVisible: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: productCardSelect,
    }),
    getTranslations("home"),
    getLocale(),
  ]);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {t("featuredTitle")}
      </h2>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={toProductCardData(product, locale)} />
        ))}
      </div>
    </section>
  );
}
