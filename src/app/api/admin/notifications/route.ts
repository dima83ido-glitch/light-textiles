import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { audienceRoles: { has: session.role } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({
      where: { audienceRoles: { has: session.role }, isRead: false },
    }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  if (body.id) {
    await prisma.notification.updateMany({
      where: { id: body.id, audienceRoles: { has: session.role } },
      data: { isRead: true },
    });
  } else {
    await prisma.notification.updateMany({
      where: { audienceRoles: { has: session.role }, isRead: false },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ ok: true });
}
