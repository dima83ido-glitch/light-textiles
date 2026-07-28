"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import type { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const STATUS_VALUES: OrderStatus[] = ["NEW", "CONFIRMED", "PACKING", "SHIPPING", "COMPLETED", "CANCELLED"];

const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  CONFIRMED: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  PACKING: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  SHIPPING: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  COMPLETED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  CANCELLED: "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
};

export function OrderStatusSelect({
  id,
  status,
  action,
}: {
  id: string;
  status: OrderStatus;
  action: (id: string, status: OrderStatus) => Promise<void>;
}) {
  const t = useTranslations("admin.orderStatus");
  const [isPending, startTransition] = useTransition();

  return (
    <select
      disabled={isPending}
      value={status}
      onChange={(e) => startTransition(() => action(id, e.target.value as OrderStatus))}
      className={cn(
        "rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none transition-colors",
        STATUS_COLORS[status],
      )}
    >
      {STATUS_VALUES.map((value) => (
        <option key={value} value={value}>
          {t(value)}
        </option>
      ))}
    </select>
  );
}
