import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/site-settings";
import { getAdminLocale } from "@/lib/admin-locale";
import { requireView } from "@/lib/rbac";
import { routing } from "@/i18n/routing";
import { ContactsForm } from "./contacts-form";

export default async function AdminContactsPage() {
  await requireView("contacts");
  const locale = await getAdminLocale();
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "admin.contacts" }),
    getSiteSettings(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("title")}</h1>
      <ContactsForm
        initial={{
          phone: settings.phone,
          viber: settings.viber,
          email: settings.email,
          workingHours: Object.fromEntries(routing.locales.map((l) => [l, settings.workingHours[l] ?? ""])),
          address: Object.fromEntries(routing.locales.map((l) => [l, settings.address[l] ?? ""])),
          facebookUrl: settings.facebookUrl,
          instagramUrl: settings.instagramUrl,
        }}
      />
    </div>
  );
}
