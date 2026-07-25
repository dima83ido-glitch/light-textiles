"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/demo-session";
import { store, genId } from "@/lib/demo-store";
import { getAdminLocale, getAdminMessages } from "@/lib/admin-locale";

async function assertOwner() {
  const session = await getSession();
  const current = session?.id ? store.adminUsers.find((u) => u.id === session.id) : null;
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
  const now = new Date();
  store.adminUsers.push({
    id: genId(),
    email: data.email,
    name: data.name,
    passwordHash,
    role: "STAFF",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath("/admin/users");
}

export async function updateStaffUser(
  id: string,
  data: { name: string; email: string; password?: string },
) {
  await assertOwner();
  const user = store.adminUsers.find((u) => u.id === id);
  if (!user) return;
  user.name = data.name;
  user.email = data.email;
  if (data.password) user.passwordHash = await bcrypt.hash(data.password, 10);
  user.updatedAt = new Date();
  revalidatePath("/admin/users");
}

export async function toggleStaffActive(id: string, isActive: boolean) {
  const session = await assertOwner();
  if (session?.id === id) return;
  const user = store.adminUsers.find((u) => u.id === id);
  if (!user) return;
  user.isActive = isActive;
  user.updatedAt = new Date();
  revalidatePath("/admin/users");
}

export async function deleteStaffUser(id: string) {
  const session = await assertOwner();
  if (session?.id === id) return;
  store.adminUsers = store.adminUsers.filter((u) => u.id !== id);
  revalidatePath("/admin/users");
}

export async function transferOwnership(targetId: string) {
  const session = await assertOwner();
  if (session?.id === targetId) return;

  const target = store.adminUsers.find((u) => u.id === targetId);
  const current = store.adminUsers.find((u) => u.id === session!.id);
  if (!target || !current) return;
  target.role = "OWNER";
  target.isActive = true;
  target.updatedAt = new Date();
  current.role = "STAFF";
  current.updatedAt = new Date();
  revalidatePath("/admin/users");
}

export async function updateOwnProfile(data: { name: string; email: string; password?: string }) {
  const session = await getSession();
  if (!session?.id) {
    const locale = await getAdminLocale();
    const messages = await getAdminMessages(locale);
    throw new Error(messages.admin.common.unauthorized);
  }

  const user = store.adminUsers.find((u) => u.id === session.id);
  if (!user) return;
  user.name = data.name;
  user.email = data.email;
  if (data.password) user.passwordHash = await bcrypt.hash(data.password, 10);
  user.updatedAt = new Date();
  revalidatePath("/admin/account");
}
