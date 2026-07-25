"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useFavoritesStore } from "@/stores/favorites-store";
import { ProductCard, type ProductCardData } from "@/components/product/product-card";

export default function FavoritesPage() {
  const t = useTranslations("favorites");
  const tCart = useTranslations("cart");
  const locale = useLocale();
  const productIds = useFavoritesStore((s) => s.productIds);
  const [products, setProducts] = useState<ProductCardData[] | null>(null);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/products/by-ids?ids=${productIds.join(",")}&locale=${locale}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products));
  }, [productIds, locale]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {t("title")}
      </h1>

      {products === null ? null : products.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)]">
            <Heart className="h-7 w-7" />
          </div>
          <p className="text-[var(--color-ink-muted)]">{t("empty")}</p>
          <Link href="/catalog" className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-[var(--color-canvas)]">
            {tCart("continueShopping")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
