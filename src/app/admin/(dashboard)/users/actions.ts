"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdminLocale, getAdminMessages } from "@/lib/admin-locale";

async function assertOwner() {
  const session = await auth();
  const current = session?.user?.id
    ? await prisma.adminUser.findUnique({ where: { id: session.user.id } })
    : null;
  if (!current || current.role !== "OWNER" || !current.isActive) {
    const locale = await getAdminLocale();
    const messages = await getAdminMessages(locale);
    throw new Error(messages.admin.users.onlyOwnerError);
  }
  return session;
}

export async function createStaffUser(data: { email: string; name: string; password: string }) {
  await assertOwner();
  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.adminUser.create({
    data: { email: data.email, name: data.name, passwordHash, role: "STAFF" },
  });
  revalidatePath("/admin/users");
}

export async function updateStaffUser(
  id: string,
  data: { name: string; email: string; password?: string },
) {
  await assertOwner();
  await prisma.adminUser.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 10) } : {}),
    },
  });
  revalidatePath("/admin/users");
}

export async function toggleStaffActive(id: string, isActive: boolean) {
  const session = await assertOwner();
  if (session?.user?.id === id) return;
  await prisma.adminUser.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/users");
}

export async function deleteStaffUser(id: string) {
  const session = await assertOwner();
  if (session?.user?.id === id) return;
  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/users");
}

export async function transferOwnership(targetId: string) {
  const session = await assertOwner();
  if (session?.user?.id === targetId) return;

  await prisma.$transaction([
    prisma.adminUser.update({ where: { id: targetId }, data: { role: "OWNER", isActive: true } }),
    prisma.adminUser.update({ where: { id: session!.user!.id }, data: { role: "STAFF" } }),
  ]);
  revalidatePath("/admin/users");
}

export async function updateOwnProfile(data: { name: string; email: string; password?: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    const locale = await getAdminLocale();
    const messages = await getAdminMessages(locale);
    throw new Error(messages.admin.common.unauthorized);
  }

  await prisma.adminUser.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      email: data.email,
      ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 10) } : {}),
    },
  });
  revalidatePath("/admin/account");
}
