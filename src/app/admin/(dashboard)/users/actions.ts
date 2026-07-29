"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertRole, requireSession } from "@/lib/rbac";
import type { AdminRole } from "@prisma/client";
import { getAdminLocale, getAdminMessages } from "@/lib/admin-locale";

async function assertOwner() {
  try {
    return await assertRole("OWNER");
  } catch {
    const locale = await getAdminLocale();
    const messages = await getAdminMessages(locale);
    throw new Error(messages.admin.users.onlyOwnerError);
  }
}

const MIN_PASSWORD_LENGTH = 8;

// The client-side form only enforces `required` (non-empty); the real length/strength
// check has to happen here since that's the actual trust boundary.
function assertStrongPassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
}

export async function createStaffUser(data: { email: string; name: string; password: string; role: AdminRole }) {
  await assertOwner();
  assertStrongPassword(data.password);
  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.adminUser.create({
    data: { email: data.email, name: data.name, passwordHash, role: data.role, isActive: true },
  });
  revalidatePath("/admin/users");
}

export async function updateStaffUser(
  id: string,
  data: { name: string; email: string; password?: string; role: AdminRole },
) {
  await assertOwner();
  if (data.password) assertStrongPassword(data.password);
  await prisma.adminUser.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 10) } : {}),
    },
  });
  revalidatePath("/admin/users");
}

export async function toggleStaffActive(id: string, isActive: boolean) {
  const session = await assertOwner();
  if (session.id === id) return;
  await prisma.adminUser.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/users");
}

export async function deleteStaffUser(id: string) {
  const session = await assertOwner();
  if (session.id === id) return;
  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/users");
}

export async function transferOwnership(targetId: string) {
  const session = await assertOwner();
  if (session.id === targetId) return;

  await prisma.$transaction([
    prisma.adminUser.update({ where: { id: targetId }, data: { role: "OWNER", isActive: true } }),
    prisma.adminUser.update({ where: { id: session.id }, data: { role: "MANAGER" } }),
  ]);
  revalidatePath("/admin/users");
}

export async function updateOwnProfile(data: { name: string; email: string; password?: string }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    const locale = await getAdminLocale();
    const messages = await getAdminMessages(locale);
    throw new Error(messages.admin.common.unauthorized);
  }
  if (data.password) assertStrongPassword(data.password);
  await prisma.adminUser.update({
    where: { id: session.id },
    data: {
      name: data.name,
      email: data.email,
      ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 10) } : {}),
    },
  });
  revalidatePath("/admin/account");
}
