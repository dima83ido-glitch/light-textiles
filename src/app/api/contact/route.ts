import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactRequestSchema } from "@/lib/validation/contact";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, phone, email, message } = parsed.data;

  await prisma.contactRequest.create({
    data: { name, phone, email: email || null, message },
  });

  return NextResponse.json({ ok: true });
}
