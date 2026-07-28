"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { recordIncoming, recordOutgoing, transferStock, adjustStock } from "./actions";

type MovementType = "INCOMING" | "OUTGOING" | "TRANSFER" | "ADJUSTMENT";

export function StockMovementForm({
  warehouseId,
  products,
  otherWarehouses,
}: {
  warehouseId: string;
  products: { id: string; label: string }[];
  otherWarehouses: { id: string; label: string }[];
}) {
  const t = useTranslations("admin.warehouses");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [type, setType] = useState<MovementType>("INCOMING");
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { productId: "", quantity: 1, note: "", toWarehouseId: "" },
  });

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]";

  const TYPES: MovementType[] = ["INCOMING", "OUTGOING", "TRANSFER", "ADJUSTMENT"];

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        if (type === "INCOMING") {
          await recordIncoming({ productId: data.productId, warehouseId, quantity: Number(data.quantity), note: data.note });
        } else if (type === "OUTGOING") {
          await recordOutgoing({ productId: data.productId, warehouseId, quantity: Number(data.quantity), note: data.note });
        } else if (type === "TRANSFER") {
          await transferStock({
            productId: data.productId,
            fromWarehouseId: warehouseId,
            toWarehouseId: data.toWarehouseId,
            quantity: Number(data.quantity),
            note: data.note,
          });
        } else {
          await adjustStock({ productId: data.productId, warehouseId, quantity: Number(data.quantity), note: data.note });
        }
        reset();
        router.refresh();
      })}
      className="mb-8 flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <div className="flex flex-wrap gap-2">
        {TYPES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              type === value
                ? "border-[var(--color-accent)] bg-[var(--color-surface-tint)] text-[var(--color-accent-ink)]"
                : "border-[var(--color-border)] text-[var(--color-ink-muted)]"
            }`}
          >
            {t(`movementType.${value}`)}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {t("product")}
        <select required className={inputClass} {...register("productId")}>
          <option value="" disabled>
            {t("selectProduct")}
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      {type === "TRANSFER" && (
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
          {t("toWarehouse")}
          <select required className={inputClass} {...register("toWarehouseId")}>
            <option value="" disabled>
              {t("selectWarehouse")}
            </option>
            {otherWarehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {type === "ADJUSTMENT" ? t("newQuantity") : t("quantity")}
        <input required type="number" min={type === "ADJUSTMENT" ? 0 : 1} className={inputClass} {...register("quantity")} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {t("note")}
        <input className={inputClass} {...register("note")} />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--color-canvas)] transition-transform active:scale-95 disabled:opacity-60"
      >
        {isSubmitting ? tc("saving") : tc("save")}
      </button>
    </form>
  );
}
