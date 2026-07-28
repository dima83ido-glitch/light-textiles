"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";

export async function adminLogin(email: string, password: string): Promise<{ error?: string }> {
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !user.isActive) return { error: "invalid" };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: "invalid" };

  await setSessionCookie({ id: user.id, email: user.email, name: user.name, role: user.role });
  return {};
}

export async function adminLogout(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}
