import { NextResponse } from "next/server";
import { quickOrderSchema } from "@/lib/validation/order";
import { createOrder } from "@/lib/orders";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = quickOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { customerName, phone, productId, variantId, nameSnapshot, unitPrice } = parsed.data;

  const order = await createOrder({
    customerName,
    phone,
    notes: "Швидке замовлення",
    items: [{ productId, variantId, nameSnapshot, unitPrice, quantity: 1 }],
  });

  return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
}
