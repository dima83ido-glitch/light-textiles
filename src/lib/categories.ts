import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type NavCategory = {
  id: string;
  slug: string;
  name: Record<string, string>;
  image: string | null;
  children: NavCategory[];
};

async function fetchCategoryTree(): Promise<NavCategory[]> {
  const categories = await prisma.category.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true, image: true, parentId: true },
  });

  const byId = new Map<string, NavCategory>(
    categories.map((c) => [
      c.id,
      { id: c.id, slug: c.slug, name: c.name as Record<string, string>, image: c.image, children: [] },
    ]),
  );

  const roots: NavCategory[] = [];
  for (const c of categories) {
    const node = byId.get(c.id)!;
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId)!.children.push(node);
    } else if (!c.parentId) {
      roots.push(node);
    }
  }

  return roots;
}

// The layout that renders the header/footer on every page is force-dynamic (see its comment),
// so nothing here is ever statically prerendered — without a data cache this query would run
// on every single request. unstable_cache persists the result across requests (5min safety-net
// revalidate, plus on-demand revalidateTag("categories") from the admin category actions), and
// the outer React cache() still dedupes repeat calls within one request (header + catalog page).
export const getCategoryTree = cache(
  unstable_cache(fetchCategoryTree, ["category-tree"], { tags: ["categories"], revalidate: 300 }),
);

export type PopularCategory = {
  id: string;
  slug: string;
  name: Record<string, string>;
  image: string | null;
  productCount: number;
};

// Used by the homepage's "popular categories" section only — a different shape/query than
// getCategoryTree (subcategories with product counts) so it's cached separately, still under
// the shared "categories" tag so admin category edits invalidate both at once.
const fetchPopularCategories = unstable_cache(
  async (): Promise<PopularCategory[]> => {
    const categories = await prisma.category.findMany({
      where: { isVisible: true, parentId: { not: null } },
      orderBy: { sortOrder: "asc" },
      take: 8,
      select: { id: true, slug: true, name: true, image: true, _count: { select: { products: true } } },
    });
    return categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name as Record<string, string>,
      image: c.image,
      productCount: c._count.products,
    }));
  },
  ["popular-categories"],
  { tags: ["categories"], revalidate: 300 },
);

export const getPopularCategories = cache(fetchPopularCategories);
