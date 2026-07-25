import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function CatalogPagination({
  currentPage,
  pageCount,
  basePath,
  searchParams,
}: {
  currentPage: number;
  pageCount: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - currentPage) <= 1,
  );

  return (
    <div className="mt-12 flex items-center justify-center gap-1.5">
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-[var(--color-ink-soft)]">…</span>}
          <Link
            href={hrefFor(p)}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors",
              p === currentPage
                ? "bg-[var(--color-ink)] text-[var(--color-canvas)]"
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-tint)]",
            )}
          >
            {p}
          </Link>
        </span>
      ))}
    </div>
  );
}
