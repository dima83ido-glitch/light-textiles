import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { getLocalized } from "@/lib/get-localized";
import { StockMovementForm } from "../stock-movement-form";

export default async function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getAdminLocale();

  const [t, tMove, warehouse, otherWarehouses, allProducts, stockLevels, movements] = await Promise.all([
    getTranslations({ locale, namespace: "admin.warehouses" }),
    getTranslations({ locale, namespace: "admin.warehouses.movementType" }),
    prisma.warehouse.findUnique({ where: { id } }),
    prisma.warehouse.findMany({ where: { NOT: { id } } }),
    prisma.product.findMany({ orderBy: { slug: "asc" }, select: { id: true, name: true } }),
    prisma.stockLevel.findMany({
      where: { warehouseId: id, quantity: { gt: 0 } },
      include: { product: true },
      orderBy: { quantity: "asc" },
    }),
    prisma.stockMovement.findMany({
      where: { OR: [{ warehouseId: id }, { fromWarehouseId: id }, { toWarehouseId: id }] },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { product: true, createdByUser: true, fromWarehouse: true, toWarehouse: true },
    }),
  ]);

  if (!warehouse) notFound();

  const productOptions = allProducts.map((p) => ({
    id: p.id,
    label: getLocalized(p.name as Record<string, string>, locale),
  }));
  const warehouseOptions = otherWarehouses.map((w) => ({
    id: w.id,
    label: getLocalized(w.name as Record<string, string>, locale),
  }));

  return (
    <div>
      <Link href="/admin/warehouses" className="mb-4 flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
        <ArrowLeft className="h-4 w-4" /> {t("title")}
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">
        {getLocalized(warehouse.name as Record<string, string>, locale)}
      </h1>

      <StockMovementForm warehouseId={id} products={productOptions} otherWarehouses={warehouseOptions} />

      <div className="mb-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">{t("currentStock")}</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-ink-soft)]">
              <th className="px-4 py-3 font-medium">{t("product")}</th>
              <th className="px-4 py-3 font-medium">{t("quantity")}</th>
            </tr>
          </thead>
          <tbody>
            {stockLevels.map((s) => (
              <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-3 text-[var(--color-ink)]">
                  {getLocalized(s.product.name as Record<string, string>, locale)}
                </td>
                <td className="px-4 py-3 font-medium text-[var(--color-ink)]">{s.quantity}</td>
              </tr>
            ))}
            {stockLevels.length === 0 && (
              <tr>
                <td colSpan={2} className="py-8 text-center text-[var(--color-ink-soft)]">
                  {t("noStock")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">{t("history")}</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-ink-soft)]">
              <th className="px-4 py-3 font-medium">{t("date")}</th>
              <th className="px-4 py-3 font-medium">{t("movementTypeLabel")}</th>
              <th className="px-4 py-3 font-medium">{t("product")}</th>
              <th className="px-4 py-3 font-medium">{t("quantity")}</th>
              <th className="px-4 py-3 font-medium">{t("by")}</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-3 text-[var(--color-ink-muted)]">{m.createdAt.toLocaleString(locale)}</td>
                <td className="px-4 py-3 text-[var(--color-ink)]">
                  {tMove(m.type)}
                  {m.type === "TRANSFER" && (
                    <span className="text-[var(--color-ink-soft)]">
                      {" "}
                      ({getLocalized(m.fromWarehouse?.name as Record<string, string> | undefined, locale)} →{" "}
                      {getLocalized(m.toWarehouse?.name as Record<string, string> | undefined, locale)})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--color-ink)]">
                  {getLocalized(m.product.name as Record<string, string>, locale)}
                </td>
                <td className="px-4 py-3 font-medium text-[var(--color-ink)]">{m.quantity}</td>
                <td className="px-4 py-3 text-[var(--color-ink-muted)]">{m.createdByUser.name}</td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--color-ink-soft)]">
                  {t("noHistory")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
