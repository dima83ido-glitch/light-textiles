"use client";

import { useEffect, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useFavoritesStore } from "@/stores/favorites-store";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-semibold text-white">
      {count}
    </span>
  );
}

export function HeaderBadges() {
  const t = useTranslations("nav");
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const favCount = useFavoritesStore((s) => s.productIds.length);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/favorites"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-accent-strong)]"
        aria-label={t("favorites")}
      >
        <Heart className="h-5 w-5" strokeWidth={1.75} />
        {mounted && <Badge count={favCount} />}
      </Link>
      <Link
        href="/cart"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-accent-strong)]"
        aria-label={t("cart")}
      >
        <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
        {mounted && <Badge count={cartCount} />}
      </Link>
    </div>
  );
}
