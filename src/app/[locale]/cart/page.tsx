"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { buttonClass } from "@/components/ui/button";

export default function CartPage() {
  const t = useTranslations("cart");
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);

  useEffect(() => setMounted(true), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse px-6 py-12">
        <div className="mb-8 h-9 w-40 rounded-full bg-[var(--color-surface-subtle)]" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 rounded-[var(--radius-card)] bg-[var(--color-surface-subtle)]" />
            ))}
          </div>
          <div className="h-40 rounded-[var(--radius-card)] bg-[var(--color-surface-subtle)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {t("title")}
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <p className="text-[var(--color-ink-muted)]">{t("empty")}</p>
          <Link href="/catalog" className={buttonClass()}>
            {t("continueShopping")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {items.map((item) => (
              <motion.div
                layout
                key={`${item.productId}-${item.variantId ?? ""}`}
                className="flex gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)]"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[var(--color-surface-subtle)]"
                >
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                  )}
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/product/${item.slug}`} className="text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-accent-strong)]">
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{item.variantName}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-[var(--color-border)]">
                      <button
                        type="button"
                        disabled={item.quantity <= 1}
                        onClick={() => setQuantity(item.productId, item.quantity - 1, item.variantId)}
                        aria-label={t("decreaseQuantity")}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.productId, item.quantity + 1, item.variantId)}
                        aria-label={t("increaseQuantity")}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-ink)]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[var(--color-ink)]">
                        {formatPrice(item.price * item.quantity)} ₴
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(item.productId, item.variantId)}
                        aria-label={t("remove")}
                        className="text-[var(--color-ink-soft)] hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="h-fit rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lifted)]">
            <div className="mb-5 flex items-center justify-between text-base">
              <span className="text-[var(--color-ink-muted)]">{t("total")}</span>
              <span className="text-xl font-semibold text-[var(--color-ink)]">{formatPrice(total)} ₴</span>
            </div>
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center rounded-full bg-[var(--color-ink)] py-3.5 text-sm font-semibold text-[var(--color-canvas)] shadow-[var(--shadow-lifted)] transition-transform hover:-translate-y-0.5"
            >
              {t("checkout")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
