"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALE_NAMES: Record<string, string> = {
  uk: "Українська",
  en: "English",
  ru: "Русский",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-[var(--color-surface-subtle)] p-0.5 text-xs font-semibold uppercase">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-label={LOCALE_NAMES[l] ?? l}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1.5 transition-colors",
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
