"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Minus, Plus, ShoppingBag, X, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useOverlayA11y } from "@/lib/use-overlay-a11y";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type Variant = { id: string; name: string; price: number };

export function ProductPurchasePanel({
  productId,
  slug,
  name,
  image,
  basePrice,
  variants,
  availability,
}: {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  basePrice: number;
  variants: Variant[];
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "ON_ORDER";
}) {
  const t = useTranslations("product");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(variants[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);

  const addToCart = useCartStore((s) => s.add);
  // See product-card.tsx for why this needs a mounted guard: the persisted favorites
  // store rehydrates from localStorage before first client paint, which would otherwise
  // mismatch the server-rendered (always-empty) state.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isFavoriteStored = useFavoritesStore((s) => s.isFavorite(productId));
  const isFavorite = mounted && isFavoriteStored;
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  const price = selectedVariant?.price ?? basePrice;
  const availabilityLabel =
    availability === "IN_STOCK" ? t("inStock") : availability === "ON_ORDER" ? t("onOrder") : t("outOfStock");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold text-[var(--color-ink)]">{formatPrice(price)} ₴</span>
        <span
          className={cn(
            "text-sm font-medium",
            availability === "IN_STOCK" ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--color-ink-soft)]",
          )}
        >
          {availabilityLabel}
        </span>
      </div>

      {variants.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-ink)]">{t("chooseSize")}</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  selectedVariant?.id === v.id
                    ? "border-[var(--color-accent)] bg-[var(--color-surface-tint)] text-[var(--color-accent-ink)]"
                    : "border-[var(--color-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-tint)]",
                )}
              >
                {v.name} · {formatPrice(v.price)} ₴
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-[var(--color-border)]">
          <button
            type="button"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label={t("decreaseQuantity")}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-ink)]"
            aria-label={t("increaseQuantity")}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(productId)}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] transition-all active:scale-90",
            isFavorite ? "text-red-500" : "text-[var(--color-ink-muted)] hover:text-red-500",
          )}
          aria-label={t("addToFavorites")}
        >
          <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() =>
            addToCart(
              {
                productId,
                variantId: selectedVariant?.id,
                slug,
                name,
                variantName: selectedVariant?.name,
                price,
                image,
              },
              quantity,
            )
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] py-3.5 text-sm font-semibold text-[var(--color-canvas)] shadow-[var(--shadow-lifted)] transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
        >
          <ShoppingBag className="h-4 w-4" />
          {t("addToCart")}
        </button>
        <button
          type="button"
          onClick={() => setQuickOrderOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--color-accent)] bg-[var(--color-surface-tint)] py-3.5 text-sm font-semibold text-[var(--color-accent-ink)] transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
        >
          <Zap className="h-4 w-4" />
          {t("quickOrder")}
        </button>
      </div>

      <AnimatePresence>
        {quickOrderOpen && (
          <QuickOrderModal
            productId={productId}
            variantId={selectedVariant?.id}
            nameSnapshot={selectedVariant ? `${name} — ${selectedVariant.name}` : name}
            unitPrice={price}
            onClose={() => setQuickOrderOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickOrderModal({
  productId,
  variantId,
  nameSnapshot,
  unitPrice,
  onClose,
}: {
  productId: string;
  variantId?: string;
  nameSnapshot: string;
  unitPrice: number;
  onClose: () => void;
}) {
  const t = useTranslations("product");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useOverlayA11y(true, onClose, dialogRef);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/orders/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name, phone, productId, variantId, nameSnapshot, unitPrice }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-order-title"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lifted)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="quick-order-title" className="text-lg font-semibold text-[var(--color-ink)]">
            {t("quickOrderTitle")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-ink)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === "success" ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400"
          >
            {t("quickOrderThanks")}
          </motion.p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <label htmlFor="quick-order-name" className="sr-only">
              {t("quickOrderName")}
            </label>
            <Input
              id="quick-order-name"
              ref={nameInputRef}
              required
              placeholder={t("quickOrderName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="quick-order-phone" className="sr-only">
              {t("quickOrderPhone")}
            </label>
            <Input
              id="quick-order-phone"
              required
              placeholder={t("quickOrderPhone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? t("quickOrderSubmitting") : t("quickOrderSubmit")}
            </Button>
            {status === "error" && <p className="text-xs text-red-500">{t("quickOrderError")}</p>}
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
