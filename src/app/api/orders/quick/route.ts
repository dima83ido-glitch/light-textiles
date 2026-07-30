import { NextResponse } from "next/server";
import { quickOrderSchema } from "@/lib/validation/order";
import { createOrder } from "@/lib/orders";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!checkRateLimit(`quick-order:${getClientIp(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = quickOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { customerName, phone, productId, variantId, nameSnapshot, unitPrice } = parsed.data;

  try {
    const order = await createOrder({
      customerName,
      phone,
      notes: "Швидке замовлення",
      items: [{ productId, variantId, nameSnapshot, unitPrice, quantity: 1 }],
    });
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("POST /api/orders/quick failed:", error);
    return NextResponse.json({ error: "This item is no longer available." }, { status: 400 });
  }
}
