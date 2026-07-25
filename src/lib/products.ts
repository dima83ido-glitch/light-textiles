import { store, withCategoryRelations } from "@/lib/demo-store";
import { getLocalized } from "@/lib/get-localized";
import type { ProductCardData } from "@/components/product/product-card";

export const PAGE_SIZE = 24;

export async function getCategoryBySlug(slug: string) {
  const category = store.categories.find((c) => c.slug === slug && c.isVisible);
  if (!category) return null;
  return withCategoryRelations(category);
}

export type CatalogSort = "newest" | "price-asc" | "price-desc";

export async function getProductsForCategoryIds(
  categoryIds: string[],
  opts: { sort?: CatalogSort; minPrice?: number; maxPrice?: number; page?: number } = {},
) {
  const { sort = "newest", minPrice, maxPrice, page = 1 } = opts;

  const matching = store.products.filter((p) => {
    if (!categoryIds.includes(p.categoryId) || !p.isVisible) return false;
    if (minPrice !== undefined && p.basePrice < minPrice) return false;
    if (maxPrice !== undefined && p.basePrice > maxPrice) return false;
    return true;
  });

  const sorted = [...matching].sort((a, b) => {
    if (sort === "price-asc") return a.basePrice - b.basePrice;
    if (sort === "price-desc") return b.basePrice - a.basePrice;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const total = sorted.length;
  const start = (page - 1) * PAGE_SIZE;
  const items = sorted.slice(start, start + PAGE_SIZE).map((p) => ({
    ...p,
    images: [...p.images].sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 1),
    variants: [...p.variants].sort((a, b) => a.price - b.price).slice(0, 1),
  }));

  return { items, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export function toProductCardData(
  product: {
    id: string;
    slug: string;
    name: unknown;
    basePrice: number;
    discountPrice: number | null;
    availability: "IN_STOCK" | "OUT_OF_STOCK" | "ON_ORDER";
    images: { url: string }[];
    variants: { price: number }[];
  },
  locale: string,
): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    name: getLocalized(product.name as Record<string, string>, locale),
    image: product.images[0]?.url,
    basePrice: product.variants[0]?.price ?? product.basePrice,
    discountPrice: product.discountPrice,
    priceFrom: product.variants.length > 0,
    availability: product.availability,
  };
}
