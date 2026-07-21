"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { NavCategory } from "@/lib/categories";
import { HeaderNav } from "./header-nav";
import { HeaderBadges } from "./header-badges";
import { LocaleSwitcher } from "./locale-switcher";

export function HeaderShell({
  groups,
  extraLinks,
  phoneDisplay,
  workingHours,
}: {
  groups: NavCategory[];
  extraLinks: { href: string; label: string }[];
  phoneDisplay: string;
  workingHours: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 shadow-[var(--shadow-soft)] backdrop-blur-lg"
          : "border-b border-transparent bg-[var(--color-surface)]/60 backdrop-blur-md",
      )}
    >
      <div className="mx-auto hidden max-w-7xl items-center justify-end gap-6 px-6 py-1.5 text-xs text-[var(--color-ink-soft)] lg:flex">
        <a href={`tel:${phoneDisplay.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1.5 hover:text-[var(--color-accent-strong)]">
          <Phone className="h-3.5 w-3.5" strokeWidth={2} />
          {phoneDisplay}
        </a>
        <span>{workingHours}</span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-strong)] text-base font-bold text-white shadow-[var(--shadow-glow)]">
            LT
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight text-[var(--color-ink)]">
              Light Textiles
            </span>
            <span className="text-[11px] font-medium text-[var(--color-ink-soft)]">
              Лайт Текстиль
            </span>
          </span>
        </Link>

        <HeaderNav groups={groups} extraLinks={extraLinks} />

        <div className="hidden items-center gap-3 lg:flex">
          <HeaderBadges />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
