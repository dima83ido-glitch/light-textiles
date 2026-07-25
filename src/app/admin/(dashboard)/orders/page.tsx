import Link from "next/link";
import { store, type OrderStatus } from "@/lib/demo-store";
import { getTranslations } from "next-intl/server";
import { formatPrice } from "@/lib/utils";
import { getAdminLocale } from "@/lib/admin-locale";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { AdminPagination } from "@/components/admin/pagination";
import { updateOrderStatus } from "./actions";

const STATUS_TAB_VALUES: (OrderStatus | "ALL")[] = [
  "ALL",
  "NEW",
  "CONFIRMED",
  "PACKING",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
];

const PAGE_SIZE = 30;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const filter = status && status !== "ALL" ? (status as OrderStatus) : undefined;
  const locale = await getAdminLocale();
  const [t, tOrders, tStatusPlural] = await Promise.all([
    getTranslations({ locale, namespace: "admin.nav" }),
    getTranslations({ locale, namespace: "admin.orders" }),
    getTranslations({ locale, namespace: "admin.orderStatusPlural" }),
  ]);

  const matching = filter ? store.orders.filter((o) => o.status === filter) : store.orders;
  const sorted = [...matching].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const total = sorted.length;
  const start = (page - 1) * PAGE_SIZE;
  const orders = sorted.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("orders")}</h1>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_TAB_VALUES.map((value) => (
          <Link
            key={value}
            href={value === "ALL" ? "/admin/orders" : `/admin/orders?status=${value}`}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              (status ?? "ALL") === value
                ? "border-[var(--color-accent)] bg-[var(--color-surface-tint)] text-[var(--color-accent-ink)]"
                : "border-[var(--color-border)] text-[var(--color-ink-muted)]"
            }`}
          >
            {tStatusPlural(value)}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-left text-[var(--color-ink-soft)]">
              <th className="px-4 py-3 font-medium">{tOrders("orderNumber")}</th>
              <th className="px-4 py-3 font-medium">{tOrders("customer")}</th>
              <th className="px-4 py-3 font-medium">{tOrders("phone")}</th>
              <th className="px-4 py-3 font-medium">{tOrders("amount")}</th>
              <th className="px-4 py-3 font-medium">{tOrders("date")}</th>
              <th className="px-4 py-3 font-medium">{tOrders("status")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-[var(--color-accent-strong)]">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--color-ink)]">{order.customerName}</td>
                <td className="px-4 py-3 text-[var(--color-ink-muted)]">{order.phone}</td>
                <td className="px-4 py-3 font-medium text-[var(--color-ink)]">{formatPrice(order.totalAmount)} ₴</td>
                <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                  {order.createdAt.toLocaleDateString(locale)}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusSelect id={order.id} status={order.status} action={updateOrderStatus} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--color-ink-soft)]">
                  {tOrders("notFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/orders" searchParams={{ status }} />
    </div>
  );
}
