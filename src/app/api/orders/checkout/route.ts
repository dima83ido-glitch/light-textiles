import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation/order";
import { createOrder } from "@/lib/orders";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!checkRateLimit(`checkout:${getClientIp(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const order = await createOrder(parsed.data);
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  } catch (error) {
    // Most failures here are the expected "item no longer exists" case from
    // resolveAuthoritativeItems, but this also silently swallowed genuine bugs/DB
    // failures with zero server-side trace — log before returning the generic message.
    console.error("POST /api/orders/checkout failed:", error);
    return NextResponse.json({ error: "One or more items in your order are no longer valid." }, { status: 400 });
  }
}
