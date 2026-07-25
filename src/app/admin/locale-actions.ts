"use server";

import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";
import { ADMIN_LOCALE_COOKIE } from "@/lib/admin-locale";

export async function setAdminLocale(locale: string) {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) return;
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}
