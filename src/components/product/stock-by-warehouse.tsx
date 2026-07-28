import { getTranslations } from "next-intl/server";
import { getLocalized } from "@/lib/get-localized";

export type StockByWarehouseData = {
  warehouse: { id: string; name: unknown };
  quantity: number;
}[];

export async function StockByWarehouse({ stockLevels, locale }: { stockLevels: StockByWarehouseData; locale: string }) {
  if (stockLevels.length === 0) return null;
  const t = await getTranslations("product");

  return (
    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--color-ink-muted)]">
      <span className="font-medium text-[var(--color-ink)]">{t("stockByWarehouse")}:</span>
      {stockLevels.map(({ warehouse, quantity }) => (
        <span key={warehouse.id}>
          {getLocalized(warehouse.name as Record<string, string>, locale)}:{" "}
          <span className={quantity > 0 ? "font-medium text-emerald-600 dark:text-emerald-400" : "text-[var(--color-ink-soft)]"}>
            {quantity}
          </span>
        </span>
      ))}
    </div>
  );
}
