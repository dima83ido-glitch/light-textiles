import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// Homepage marketing content (banners/FAQ/reviews) — same reasoning as getCategoryTree in
// categories.ts: the layout above these is force-dynamic, so without a data cache these run
// on every request. Cached per-content-type with a 5min safety-net revalidate, plus on-demand
// revalidateTag() from the admin actions that edit each one.

export const getActiveBanners = unstable_cache(
  () => prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
  ["homepage-banners"],
  { tags: ["banners"], revalidate: 300 },
);

export const getActiveFaqItems = unstable_cache(
  () => prisma.faqItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ["homepage-faq"],
  { tags: ["faq"], revalidate: 300 },
);

export const getApprovedReviews = unstable_cache(
  () => prisma.review.findMany({ where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 6 }),
  ["homepage-reviews"],
  { tags: ["reviews"], revalidate: 300 },
);
