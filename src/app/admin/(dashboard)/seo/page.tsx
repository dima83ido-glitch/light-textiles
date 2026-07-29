import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { requireView } from "@/lib/rbac";
import { routing } from "@/i18n/routing";
import { SeoForm } from "./seo-form";

export default async function AdminSeoPage() {
  await requireView("seo");
  const locale = await getAdminLocale();
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "admin.seo" }),
    prisma.siteSettings.findUnique({ where: { id: "main" } }),
  ]);
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
