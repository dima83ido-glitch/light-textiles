import Link from "next/link";
import { Package, FolderTree, ShoppingCart, Clock, AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getAdminLocale } from "@/lib/admin-locale";
import { getSession } from "@/lib/session";
import { getLocalized } from "@/lib/get-localized";

export default async function AdminDashboardPage() {
  const locale = await getAdminLocale();
  const session = await getSession();
  const isOwner = session?.role === "OWNER";
  const [t, tCommon, tStatus] = await Promise.all([
    getTranslations({ locale, namespace: "admin.dashboard" }),
    getTranslations({ locale, namespace: "admin.common" }),
    getTranslations({ locale, namespace: "admin.orderStatus" }),
  ]);

  const [productCount, categoryCount, newOrders, totalOrders, recentOrders, revenueAgg, lowStockLevels] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count({ where: { status: "NEW" } }),
      prisma.order.count(),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      isOwner
        ? prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "CANCELLED" } } })
        : Promise.resolve(null),
      prisma.$queryRaw<{ productId: string; name: unknown; warehouseName: unknown; quantity: number }[]>`
        SELECT p.id as "productId", p.name, w.name as "warehouseName", s.quantity
        FROM "StockLevel" s
        JOIN "Product" p ON p.id = s."productId"
        JOIN "Warehouse" w ON w.id = s."warehouseId"
        WHERE s.quantity <= p."lowStockThreshold"
        ORDER BY s.quantity ASC
        LIMIT 8
      `,
    ]);

  const stats = isOwner
    ? [
        { label: t("products"), value: productCount, icon: Package, href: "/admin/products" },
        { label: t("categories"), value: categoryCount, icon: FolderTree, href: "/admin/categories" },
        { label: t("newOrders"), value: newOrders, icon: Clock, href: "/admin/orders" },
        { label: t("totalOrders"), value: totalOrders, icon: ShoppingCart, href: "/admin/orders" },
      ]
    : [
        { label: t("newOrders"), value: newOrders, icon: Clock, href: "/admin/orders" },
        { label: t("totalOrders"), value: totalOrders, icon: ShoppingCart, href: "/admin/orders" },
      ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-[var(--color-ink)]">{t("title")}</h1>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lifted)]"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)]">
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-semibold text-[var(--color-ink)]">{stat.value}</p>
            <p className="text-sm text-[var(--color-ink-muted)]">{stat.label}</p>
          </Link>
        ))}
      </div>

      {isOwner && revenueAgg && (
        <div className="mb-10 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[var(--color-ink-muted)]">{t("revenue")}</p>
          <p className="text-3xl font-semibold text-[var(--color-ink)]">
            {formatPrice(revenueAgg._sum.totalAmount ?? 0)} ₴
          </p>
        </div>
      )}

      {!isOwner && (
        <div className="mb-10 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("lowStockAlerts")}</h2>
          </div>
          {lowStockLevels.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-soft)]">{t("noLowStock")}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {lowStockLevels.map((row, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-[var(--color-ink)]">
                    {getLocalized(row.name as Record<string, string>, locale)} —{" "}
                    {getLocalized(row.warehouseName as Record<string, string>, locale)}
                  </span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">{row.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">
            {isOwner ? t("recentOrders") : t("openOrdersQueue")}
          </h2>
          <Link href="/admin/orders" className="text-sm font-medium text-[var(--color-accent-strong)]">
            {t("allOrders")}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-ink-soft)]">
                <th className="pb-2 font-medium">{t("orderNumber")}</th>
                <th className="pb-2 font-medium">{t("customer")}</th>
                <th className="pb-2 font-medium">{tCommon("status")}</th>
                <th className="pb-2 font-medium">{t("amount")}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-[var(--color-accent-strong)]">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 text-[var(--color-ink)]">{order.customerName}</td>
                  <td className="py-3 text-[var(--color-ink-muted)]">{tStatus(order.status)}</td>
                  <td className="py-3 font-medium text-[var(--color-ink)]">{formatPrice(order.totalAmount)} ₴</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[var(--color-ink-soft)]">
                    {t("noOrders")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
