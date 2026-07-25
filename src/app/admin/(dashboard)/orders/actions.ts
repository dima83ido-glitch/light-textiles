"use server";

import { revalidatePath } from "next/cache";
import { store, type OrderStatus } from "@/lib/demo-store";

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const order = store.orders.find((o) => o.id === id);
  if (!order) return;
  order.status = status;
  order.updatedAt = new Date();
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
