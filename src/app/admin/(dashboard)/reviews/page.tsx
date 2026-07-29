import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { requireView } from "@/lib/rbac";
import { getLocalized } from "@/lib/get-localized";
import { VisibilityToggle } from "@/components/admin/visibility-toggle";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPagination } from "@/components/admin/pagination";
import { toggleReviewApproval, deleteReview } from "./actions";
import { NewReviewForm } from "./new-review-form";

const PAGE_SIZE = 30;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireView("reviews");
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const locale = await getAdminLocale();
  const [t, total, reviews] = await Promise.all([
    getTranslations({ locale, namespace: "admin.reviews" }),
    prisma.review.count(),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { product: { select: { name: true } } },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("title")}</h1>

      <NewReviewForm />

      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex items-start justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <p className="text-sm font-semibold text-[var(--color-ink)]">{review.authorName}</p>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5" fill={i < review.rating ? "currentColor" : "none"} />
                  ))}
                </div>
              </div>
              {review.product && (
                <p className="mb-1 text-xs text-[var(--color-ink-soft)]">
                  {getLocalized(review.product.name as Record<string, string>, locale)}
                </p>
              )}
              <p className="text-sm text-[var(--color-ink-muted)]">{review.text}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <VisibilityToggle id={review.id} isVisible={review.isApproved} action={toggleReviewApproval} />
              <DeleteButton id={review.id} action={deleteReview} />
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-10 text-center text-sm text-[var(--color-ink-soft)]">
            {t("empty")}
          </p>
        )}
      </div>
      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/reviews" />
    </div>
  );
}
