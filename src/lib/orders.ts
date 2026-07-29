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

// The client only ever supplies productId/variantId/quantity in good faith — unitPrice is
// re-derived here from the database so a tampered request can't check out at an arbitrary price.
async function resolveAuthoritativeItems(items: OrderItemInput[]) {
  const productIds = [...new Set(items.map((item) => item.productId).filter((id): id is string => !!id))];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });
  const productsById = new Map(products.map((p) => [p.id, p]));

  return items.map((item) => {
    if (!item.productId) {
      throw new Error("Order item is missing productId");
    }
    const product = productsById.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    let unitPrice: number;
    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        throw new Error(`Variant ${item.variantId} not found on product ${item.productId}`);
      }
      unitPrice = variant.price;
    } else {
      unitPrice = product.discountPrice ?? product.basePrice;
    }

    return {
      productId: item.productId,
      variantId: item.variantId,
      nameSnapshot: item.nameSnapshot,
      unitPrice,
      quantity: item.quantity,
    };
  });
}

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
  const items = await resolveAuthoritativeItems(input.items);
  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
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
        create: items.map((item) => ({
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
