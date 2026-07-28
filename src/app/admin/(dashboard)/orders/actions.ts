"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertCanEdit } from "@/lib/rbac";
import type { OrderStatus } from "@prisma/client";

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await assertCanEdit("orders");
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
