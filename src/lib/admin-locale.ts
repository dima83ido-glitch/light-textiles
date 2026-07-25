import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";

export const ADMIN_LOCALE_COOKIE = "ADMIN_LOCALE";

export async function getAdminLocale(): Promise<(typeof routing.locales)[number]> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_LOCALE_COOKIE)?.value;
  return routing.locales.includes(value as (typeof routing.locales)[number])
    ? (value as (typeof routing.locales)[number])
    : routing.defaultLocale;
}

export async function getAdminMessages(locale: string) {
  return (await import(`../../messages/${locale}.json`)).default;
}
