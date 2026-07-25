import { getTranslations, getLocale } from "next-intl/server";
import { getCategoryTree } from "@/lib/categories";
import { getSiteSettings } from "@/lib/site-settings";
import { getLocalized } from "@/lib/get-localized";
import { HeaderShell } from "./header-shell";

export const revalidate = 300;

export async function SiteHeader() {
  const [groups, settings, t, locale] = await Promise.all([
    getCategoryTree(),
    getSiteSettings(),
    getTranslations("nav"),
    getLocale(),
  ]);

  const extraLinks = [
    { href: "/custom-order", label: t("customOrder") },
    { href: "/contacts", label: t("contacts") },
  ];

  const workingHours = getLocalized(settings.workingHours, locale);

  return (
    <HeaderShell
      groups={groups}
      extraLinks={extraLinks}
      phoneDisplay={settings.phoneDisplay}
      workingHours={workingHours}
    />
  );
}
