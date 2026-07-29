import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type NavCategory = {
  id: string;
  slug: string;
  name: Record<string, string>;
  image: string | null;
  children: NavCategory[];
};

// Rendered by the header on every page and again by the catalog page — cache() dedupes
// those into a single Prisma call per request instead of two.
export const getCategoryTree = cache(async function getCategoryTree(): Promise<NavCategory[]> {
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
});
