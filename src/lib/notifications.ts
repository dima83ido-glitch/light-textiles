import { prisma } from "@/lib/prisma";
import type { Order, Product } from "@prisma/client";

function productDisplayName(product: Product): string {
  const name = product.name as Record<string, string> | null;
  return name?.uk ?? name?.ru ?? name?.en ?? product.slug;
}

export async function notifyNewOrder(order: Order): Promise<void> {
  await prisma.notification.create({
    data: {
      type: "NEW_ORDER",
      message: `New order ${order.orderNumber} from ${order.customerName} (${order.totalAmount} UAH)`,
      orderId: order.id,
      audienceRoles: ["OWNER", "MANAGER"],
    },
  });
}

/** Checks the product's low-stock threshold against a warehouse's new quantity and notifies if crossed. */
export async function maybeNotifyLowStock(product: Product, warehouseId: string, newQuantity: number): Promise<void> {
  if (newQuantity > product.lowStockThreshold) return;

  await prisma.notification.create({
    data: {
      type: "LOW_STOCK",
      message: `Low stock: ${productDisplayName(product)} has ${newQuantity} left (threshold ${product.lowStockThreshold})`,
      productId: product.id,
      warehouseId,
      audienceRoles: ["OWNER", "MANAGER", "WAREHOUSE"],
    },
  });
}
