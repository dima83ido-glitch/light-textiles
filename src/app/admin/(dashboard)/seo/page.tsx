import { getTranslations } from "next-intl/server";
import { store } from "@/lib/demo-store";
import { getAdminLocale } from "@/lib/admin-locale";
import { routing } from "@/i18n/routing";
import { SeoForm } from "./seo-form";

export default async function AdminSeoPage() {
  const locale = await getAdminLocale();
  const [t] = await Promise.all([getTranslations({ locale, namespace: "admin.seo" })]);
  const settings = store.siteSettings;
  const metaTitle = (settings?.metaTitle as Record<string, string> | null) ?? {};
  const metaDescription = (settings?.metaDescription as Record<string, string> | null) ?? {};

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-[var(--color-ink)]">{t("title")}</h1>
      <p className="mb-6 max-w-2xl text-sm text-[var(--color-ink-muted)]">{t("description")}</p>
      <SeoForm
        initial={{
          metaTitle: Object.fromEntries(routing.locales.map((l) => [l, metaTitle[l] ?? ""])),
          metaDescription: Object.fromEntries(routing.locales.map((l) => [l, metaDescription[l] ?? ""])),
        }}
      />
    </div>
  );
}
