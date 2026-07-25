"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { routing } from "@/i18n/routing";
import { setAdminLocale } from "@/app/admin/locale-actions";
import { cn } from "@/lib/utils";

export function AdminLocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-[var(--color-surface-subtle)] p-0.5 text-xs font-semibold uppercase">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await setAdminLocale(l);
              router.refresh();
            })
          }
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            l === locale
              ? "bg-[var(--color-surface)] text-[var(--color-accent-strong)] shadow-sm"
              : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
