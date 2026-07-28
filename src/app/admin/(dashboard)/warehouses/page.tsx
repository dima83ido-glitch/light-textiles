import Link from "next/link";
import { Warehouse as WarehouseIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { getLocalized } from "@/lib/get-localized";

export default async function AdminWarehousesPage() {
  const locale = await getAdminLocale();
  const [t, warehouses] = await Promise.all([
    getTranslations({ locale, namespace: "admin.warehouses" }),
    prisma.warehouse.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { stockLevels: true } },
        stockLevels: { select: { quantity: true } },
      },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("title")}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {warehouses.map((w) => {
          const totalUnits = w.stockLevels.reduce((sum, s) => sum + s.quantity, 0);
          return (
            <Link
              key={w.id}
              href={`/admin/warehouses/${w.id}`}
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lifted)]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)]">
                <WarehouseIcon className="h-5 w-5" />
              </div>
              <p className="text-lg font-semibold text-[var(--color-ink)]">
                {getLocalized(w.name as Record<string, string>, locale)}
              </p>
              <p className="text-sm text-[var(--color-ink-muted)]">
                {t("productsStocked", { count: w._count.stockLevels })} · {t("unitsInStock", { count: totalUnits })}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
