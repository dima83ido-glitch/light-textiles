"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function adminLogin(email: string, password: string): Promise<{ error?: string }> {
  // Keyed per attempted email (not IP) so this can't be defeated by IP spoofing/rotation,
  // and so it slows down brute-forcing any single account regardless of where requests come from.
  const rateLimitKey = `login:${email.trim().toLowerCase()}`;
  if (!checkRateLimit(rateLimitKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) {
    return { error: "rate_limited" };
  }

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
