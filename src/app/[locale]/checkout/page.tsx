"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/order";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const [mounted, setMounted] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Omit<CheckoutInput, "items">>({
    resolver: zodResolver(checkoutSchema.omit({ items: true })),
  });

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const onSubmit = async (data: Omit<CheckoutInput, "items">) => {
    const res = await fetch("/api/orders/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          nameSnapshot: i.variantName ? `${i.name} — ${i.variantName}` : i.name,
          unitPrice: i.price,
          quantity: i.quantity,
        })),
      }),
    });
    if (res.ok) {
      const json = await res.json();
      setOrderNumber(json.orderNumber);
      clear();
    }
  };

  if (!mounted) return <div className="mx-auto max-w-3xl px-6 py-20" />;

  if (orderNumber) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-6 py-24 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">{t("success")}</h1>
        <p className="text-sm text-[var(--color-ink-soft)]">№ {orderNumber}</p>
        <Link href="/" className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-white">
          На головну
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="mb-6 text-[var(--color-ink-muted)]">Ваш кошик порожній.</p>
        <Link href="/catalog" className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-white">
          До каталогу
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20";

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {t("title")}
      </h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 lg:col-span-2">
          <div>
            <input placeholder={t("name")} className={inputClass} {...register("customerName")} />
            {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName.message}</p>}
          </div>
          <div>
            <input placeholder={t("phone")} className={inputClass} {...register("phone")} />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <input placeholder={t("email")} className={inputClass} {...register("email")} />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder={t("city")} className={inputClass} {...register("city")} />
            <select className={inputClass} {...register("deliveryMethod")} defaultValue="">
              <option value="" disabled>
                {t("deliveryMethod")}
              </option>
              <option value="nova-poshta">{t("novaPoshta")}</option>
              <option value="ukr-poshta">{t("ukrPoshta")}</option>
            </select>
          </div>
          <input placeholder={t("address")} className={inputClass} {...register("address")} />
          <textarea placeholder={t("notes")} rows={3} className={inputClass} {...register("notes")} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-[var(--color-ink)] py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-lifted)] disabled:opacity-60"
          >
            {t("submit")}
          </button>
        </form>

        <div className="h-fit rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex justify-between text-sm">
                <span className="text-[var(--color-ink-muted)]">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium text-[var(--color-ink)]">
                  {formatPrice(item.price * item.quantity)} ₴
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-[var(--color-border)] pt-4 text-base font-semibold text-[var(--color-ink)]">
            <span>Разом</span>
            <span>{formatPrice(total)} ₴</span>
          </div>
        </div>
      </div>
    </div>
  );
}
