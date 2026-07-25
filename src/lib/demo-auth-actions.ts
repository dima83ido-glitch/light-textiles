"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { store } from "@/lib/demo-store";
import { setSessionCookie, clearSessionCookie } from "@/lib/demo-session";

export async function demoLogin(email: string, password: string): Promise<{ error?: string }> {
  const user = store.adminUsers.find((u) => u.email === email);
  if (!user || !user.isActive) return { error: "invalid" };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: "invalid" };

  await setSessionCookie({ id: user.id, email: user.email, name: user.name, role: user.role });
  return {};
}

export async function demoLogout(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}
