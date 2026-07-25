import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getAdminLocale } from "@/lib/admin-locale";

export async function AdminPagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.common" });

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (value) params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const linkClass =
    "flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-subtle)] aria-disabled:pointer-events-none aria-disabled:opacity-40";

  return (
    <div className="mt-5 flex items-center justify-between">
      <Link
        href={buildHref(page - 1)}
        aria-disabled={page <= 1}
        className={linkClass}
      >
        <ChevronLeft className="h-4 w-4" /> {t("previous")}
      </Link>
      <p className="text-sm text-[var(--color-ink-soft)]">
        {t("pageInfo", { page, total: totalPages })}
      </p>
      <Link
        href={buildHref(page + 1)}
        aria-disabled={page >= totalPages}
        className={linkClass}
      >
        {t("next")} <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
