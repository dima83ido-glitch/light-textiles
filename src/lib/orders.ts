import { prisma } from "@/lib/prisma";
import type { Order, PaymentMethod } from "@prisma/client";
import { notifyNewOrder } from "@/lib/notifications";

export function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LT-${date}-${random}`;
}

export type OrderItemInput = {
  productId?: string;
  variantId?: string;
  nameSnapshot: string;
  unitPrice: number;
  quantity: number;
};

export async function createOrder(input: {
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  deliveryMethod?: string;
  warehouseNumber?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  items: OrderItemInput[];
}): Promise<Order> {
  const totalAmount = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: input.customerName,
      phone: input.phone,
      email: input.email || null,
      address: input.address || null,
      city: input.city || null,
      deliveryMethod: input.deliveryMethod || null,
      warehouseNumber: input.warehouseNumber || null,
      paymentMethod: input.paymentMethod ?? "CASH_ON_DELIVERY",
      status: "NEW",
      totalAmount,
      notes: input.notes || null,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId ?? null,
          variantId: item.variantId ?? null,
          nameSnapshot: item.nameSnapshot,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.unitPrice * item.quantity,
        })),
      },
    },
  });

  await notifyNewOrder(order);

  return order;
}
