import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getAdminLocale } from "@/lib/admin-locale";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { updateOrderStatus } from "../actions";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getAdminLocale();
  const [t, order] = await Promise.all([
    getTranslations({ locale, namespace: "admin.orders" }),
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
  ]);

  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
        <ArrowLeft className="h-4 w-4" /> {t("allOrders")}
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
          {t("orderTitle", { orderNumber: order.orderNumber })}
        </h1>
        <OrderStatusSelect id={order.id} status={order.status} action={updateOrderStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">{t("items")}</h2>
          <div className="flex flex-col divide-y divide-[var(--color-border)]">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-[var(--color-ink)]">{item.nameSnapshot}</p>
                  <p className="text-xs text-[var(--color-ink-soft)]">
                    {formatPrice(item.unitPrice)} ₴ × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-[var(--color-ink)]">{formatPrice(item.lineTotal)} ₴</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-[var(--color-border)] pt-4 text-base font-semibold text-[var(--color-ink)]">
            <span>{t("total")}</span>
            <span>{formatPrice(order.totalAmount)} ₴</span>
          </div>

          {order.notes && (
            <div className="mt-6 rounded-2xl bg-[var(--color-surface-subtle)] p-4">
              <p className="mb-1 text-xs font-semibold text-[var(--color-ink-soft)]">{t("comment")}</p>
              <p className="text-sm text-[var(--color-ink)]">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">{t("customer")}</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-xs text-[var(--color-ink-soft)]">{t("name")}</dt>
              <dd className="text-[var(--color-ink)]">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-ink-soft)]">{t("phone")}</dt>
              <dd className="text-[var(--color-ink)]">
                <a href={`tel:${order.phone}`} className="hover:text-[var(--color-accent-strong)]">
                  {order.phone}
                </a>
              </dd>
            </div>
            {order.email && (
              <div>
                <dt className="text-xs text-[var(--color-ink-soft)]">{t("email")}</dt>
                <dd className="text-[var(--color-ink)]">{order.email}</dd>
              </div>
            )}
            {order.city && (
              <div>
                <dt className="text-xs text-[var(--color-ink-soft)]">{t("city")}</dt>
                <dd className="text-[var(--color-ink)]">{order.city}</dd>
              </div>
            )}
            {order.address && (
              <div>
                <dt className="text-xs text-[var(--color-ink-soft)]">{t("address")}</dt>
                <dd className="text-[var(--color-ink)]">{order.address}</dd>
              </div>
            )}
            {order.deliveryMethod && (
              <div>
                <dt className="text-xs text-[var(--color-ink-soft)]">{t("delivery")}</dt>
                <dd className="text-[var(--color-ink)]">{order.deliveryMethod}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-[var(--color-ink-soft)]">{t("date")}</dt>
              <dd className="text-[var(--color-ink)]">{order.createdAt.toLocaleString(locale)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
