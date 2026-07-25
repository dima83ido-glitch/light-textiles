import { NextResponse } from "next/server";
import { store, genId } from "@/lib/demo-store";
import { contactRequestSchema } from "@/lib/validation/contact";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, phone, email, message } = parsed.data;

  store.contactRequests.push({
    id: genId(),
    name,
    phone,
    email: email || null,
    message,
    isHandled: false,
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true });
}
