import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactRequestSchema } from "@/lib/validation/contact";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!checkRateLimit(`contact:${getClientIp(request)}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = contactRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, phone, email, message } = parsed.data;

  await prisma.contactRequest.create({
    data: { name, phone, email: email || null, message, isHandled: false },
  });

  return NextResponse.json({ ok: true });
}
