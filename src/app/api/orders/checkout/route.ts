import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation/order";
import { createOrder } from "@/lib/orders";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const order = await createOrder(parsed.data);

  return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
}
