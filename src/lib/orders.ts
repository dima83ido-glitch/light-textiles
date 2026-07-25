import { store, genId } from "@/lib/demo-store";
import type { Order, OrderItem } from "@/lib/demo-store";

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
  notes?: string;
  items: OrderItemInput[];
}): Promise<Order> {
  const totalAmount = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const orderNumber = generateOrderNumber();
  const orderId = genId();
  const now = new Date();

  const items: OrderItem[] = input.items.map((item) => ({
    id: genId(),
    orderId,
    productId: item.productId ?? null,
    variantId: item.variantId ?? null,
    nameSnapshot: item.nameSnapshot,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.unitPrice * item.quantity,
  }));

  const order: Order = {
    id: orderId,
    orderNumber,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email || null,
    address: input.address || null,
    city: input.city || null,
    deliveryMethod: input.deliveryMethod || null,
    status: "NEW",
    totalAmount,
    notes: input.notes || null,
    items,
    createdAt: now,
    updatedAt: now,
  };

  store.orders.push(order);
  return order;
}
