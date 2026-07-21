import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ProductCard, type ProductCardData } from "@/components/product/product-card";

export async function FeaturedProducts() {
  const [products, t, locale] = await Promise.all([
    prisma.product.findMany({
      where: { isVisible: true, isFeatured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { orderBy: { price: "asc" }, take: 1 },
      },
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
        {products.map((product) => {
          const name = (product.name as Record<string, string>)[locale] ?? (product.name as Record<string, string>).uk;
          const price = product.variants[0]?.price ?? product.basePrice;
          const data: ProductCardData = {
            id: product.id,
            slug: product.slug,
            name,
            image: product.images[0]?.url,
            basePrice: price,
            discountPrice: product.discountPrice,
            priceFrom: product.variants.length > 0,
            availability: product.availability,
          };
          return <ProductCard key={product.id} product={data} />;
        })}
      </div>
    </section>
  );
}
