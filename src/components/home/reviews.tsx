import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { store } from "@/lib/demo-store";

export async function Reviews() {
  const reviews = [...store.reviews]
    .filter((r) => r.isApproved)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);
  const t = await getTranslations("home");

  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {t("reviewsTitle")}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
          >
            <div className="mb-3 flex gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4" fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />
              ))}
            </div>
            <p className="mb-4 text-sm leading-relaxed text-[var(--color-ink-muted)]">{review.text}</p>
            <p className="text-sm font-semibold text-[var(--color-ink)]">{review.authorName}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
