"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function CatalogToolbar({ total }: { total: number }) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const SORT_OPTIONS: { value: string; label: string }[] = [
    { value: "newest", label: t("sortNewest") },
    { value: "price-asc", label: t("sortPriceAsc") },
    { value: "price-desc", label: t("sortPriceDesc") },
  ];

  const currentSort = searchParams.get("sort") ?? "newest";
  const minPrice = searchParams.get("min") ?? "";
  const maxPrice = searchParams.get("max") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-ink-muted)]">{t("resultsCount", { count: total })}</p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-tint)]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("filters")}
          </button>

          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateParams({ sort: e.target.value === "newest" ? null : e.target.value })}
              className="appearance-none rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-4 pr-9 text-sm font-medium text-[var(--color-ink)] outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-60" />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid overflow-hidden transition-all duration-300",
          filtersOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              updateParams({
                min: (form.get("min") as string) || null,
                max: (form.get("max") as string) || null,
              });
            }}
            className="flex flex-wrap items-end gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4"
          >
            <div>
              <label className="mb-1 block text-xs text-[var(--color-ink-soft)]">{t("priceFrom")}</label>
              <input
                name="min"
                type="number"
                min={0}
                defaultValue={minPrice}
                className="w-28 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-ink-soft)]">{t("priceTo")}</label>
              <input
                name="max"
                type="number"
                min={0}
                defaultValue={maxPrice}
                className="w-28 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-sm font-semibold text-[var(--color-canvas)] transition-all duration-200 active:scale-95"
            >
              {t("apply")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
