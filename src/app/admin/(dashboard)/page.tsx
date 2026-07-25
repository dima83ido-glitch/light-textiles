import Link from "next/link";
import { Package, FolderTree, ShoppingCart, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { store } from "@/lib/demo-store";
import { formatPrice } from "@/lib/utils";
import { getAdminLocale } from "@/lib/admin-locale";

export default async function AdminDashboardPage() {
  const locale = await getAdminLocale();
  const [t, tCommon, tStatus] = await Promise.all([
    getTranslations({ locale, namespace: "admin.dashboard" }),
    getTranslations({ locale, namespace: "admin.common" }),
    getTranslations({ locale, namespace: "admin.orderStatus" }),
  ]);

  const productCount = store.products.length;
  const categoryCount = store.categories.length;
  const newOrders = store.orders.filter((o) => o.status === "NEW").length;
  const totalOrders = store.orders.length;
  const recentOrders = [...store.orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 6);
  const revenueSum = store.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const stats = [
    { label: t("products"), value: productCount, icon: Package, href: "/admin/products" },
    { label: t("categories"), value: categoryCount, icon: FolderTree, href: "/admin/categories" },
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

      <div className="mb-10 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
        <p className="text-sm text-[var(--color-ink-muted)]">{t("revenue")}</p>
        <p className="text-3xl font-semibold text-[var(--color-ink)]">
          {formatPrice(revenueSum)} ₴
        </p>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">{t("recentOrders")}</h2>
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
