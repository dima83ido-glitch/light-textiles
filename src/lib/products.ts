import { prisma } from "@/lib/prisma";
import { getLocalized } from "@/lib/get-localized";
import type { ProductCardData } from "@/components/product/product-card";

export const PAGE_SIZE = 24;

// toProductCardData below only ever reads these fields — select (not include) so list views
// (catalog grid, featured products, similar products, favorites) don't pull the full row
// (description, metaTitle/metaDescription, sourceUrl, etc.) for every product on the page.
export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  basePrice: true,
  discountPrice: true,
  availability: true,
  images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
  variants: { select: { price: true }, orderBy: { price: "asc" }, take: 1 },
} as const;

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug, isVisible: true },
    include: {
      children: {
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, slug: true, name: true },
      },
      parent: { select: { slug: true, name: true } },
    },
  });
  return category;
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
      ? { basePrice: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } }
      : {}),
  };

  const orderBy =
    sort === "price-asc"
      ? { basePrice: "asc" as const }
      : sort === "price-desc"
        ? { basePrice: "desc" as const }
        : { createdAt: "desc" as const };

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: productCardSelect,
    }),
  ]);

  return { items, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isVisible: true },
    include: {
      category: { select: { name: true, slug: true } },
      images: { select: { url: true }, orderBy: { sortOrder: "asc" } },
      variants: { select: { id: true, name: true, price: true }, orderBy: { sortOrder: "asc" } },
      stockLevels: {
        select: { quantity: true, warehouse: { select: { id: true, name: true } } },
      },
    },
  });
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
