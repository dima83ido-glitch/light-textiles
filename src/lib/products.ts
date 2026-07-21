import { prisma } from "@/lib/prisma";
import type { ProductCardData } from "@/components/product/product-card";

export const PAGE_SIZE = 24;

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug, isVisible: true },
    include: {
      children: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } },
      parent: true,
    },
  });
}

export type CatalogSort = "newest" | "price-asc" | "price-desc";

export async function getProductsForCategoryIds(
  categoryIds: string[],
  opts: { sort?: CatalogSort; minPrice?: number; maxPrice?: number; page?: number } = {},
) {
  const { sort = "newest", minPrice, maxPrice, page = 1 } = opts;

  const where = {
    categoryId: { in: categoryIds },
    isVisible: true,
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          basePrice: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy =
    sort === "price-asc"
      ? { basePrice: "asc" as const }
      : sort === "price-desc"
        ? { basePrice: "desc" as const }
        : { createdAt: "desc" as const };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { orderBy: { price: "asc" }, take: 1 },
      },
    }),
    prisma.product.count({ where }),
  ]);

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
  const nameMap = product.name as Record<string, string>;
  return {
    id: product.id,
    slug: product.slug,
    name: nameMap[locale] ?? nameMap.uk,
    image: product.images[0]?.url,
    basePrice: product.variants[0]?.price ?? product.basePrice,
    discountPrice: product.discountPrice,
    priceFrom: product.variants.length > 0,
    availability: product.availability,
  };
}
