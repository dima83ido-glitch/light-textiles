import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getApprovedReviews } from "@/lib/homepage-content";
import { Reveal } from "@/components/ui/reveal";

export async function Reviews() {
  const [reviews, t] = await Promise.all([getApprovedReviews(), getTranslations("home")]);

  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {t("reviewsTitle")}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, i) => (
          <Reveal
            key={review.id}
            delay={(i % 3) * 0.08}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lifted)]"
          >
            <div className="mb-3 flex gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4" fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />
              ))}
            </div>
            <p className="mb-4 text-sm leading-relaxed text-[var(--color-ink-muted)]">{review.text}</p>
            <p className="text-sm font-semibold text-[var(--color-ink)]">{review.authorName}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
