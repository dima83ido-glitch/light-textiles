"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useFavoritesStore } from "@/stores/favorites-store";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  image?: string;
  basePrice: number;
  discountPrice?: number | null;
  priceFrom?: boolean;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "ON_ORDER";
};

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const t = useTranslations("product");
  // Zustand's persist middleware rehydrates from localStorage before the client's first
  // paint, while SSR always renders the default (empty) state — reading the store value
  // straight into render would mismatch. Only trust it once mounted, matching the pattern
  // already used in header-badges.tsx/theme-toggle.tsx.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isFavoriteStored = useFavoritesStore((s) => s.isFavorite(product.id));
  const isFavorite = mounted && isFavoriteStored;
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const addToCart = useCartStore((s) => s.add);

  const price = product.discountPrice ?? product.basePrice;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.basePrice;

  const availabilityLabel =
    product.availability === "IN_STOCK"
      ? t("inStock")
      : product.availability === "ON_ORDER"
        ? t("onOrder")
        : t("outOfStock");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lifted)]"
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-[var(--color-surface-subtle)]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-ink-soft)]">
            Light Textiles
          </div>
        )}

        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--color-accent-strong)] px-2.5 py-1 text-[11px] font-semibold text-white">
            -{Math.round(100 - (product.discountPrice! / product.basePrice) * 100)}%
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
          aria-label={t("addToFavorites")}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)]/90 shadow-sm backdrop-blur transition-all duration-150 active:scale-90",
            isFavorite ? "text-red-500" : "text-[var(--color-ink-muted)] hover:text-red-500",
          )}
        >
          <Heart className="h-4.5 w-4.5" fill={isFavorite ? "currentColor" : "none"} strokeWidth={1.75} />
        </button>

        {/* Always visible on touch devices (no hover to reveal it on); fades in on hover
            for pointer/desktop so the image stays clean until intent is shown. */}
        <div className="absolute inset-x-3 bottom-3 translate-y-0 opacity-100 transition-all duration-200 ease-out lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addToCart({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price,
                image: product.image,
              });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] py-2.5 text-sm font-semibold text-[var(--color-canvas)] shadow-lg transition-transform active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" />
            {t("addToCart")}
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent-strong)]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {product.priceFrom && (
              <span className="text-xs text-[var(--color-ink-soft)]">{t("priceFrom")}</span>
            )}
            <span className="text-lg font-semibold text-[var(--color-ink)]">
              {formatPrice(price)} ₴
            </span>
            {hasDiscount && (
              <span className="text-xs text-[var(--color-ink-soft)] line-through">
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>
          <span
            className={cn(
              "text-[11px] font-medium",
              product.availability === "IN_STOCK"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-[var(--color-ink-soft)]",
            )}
          >
            {availabilityLabel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
