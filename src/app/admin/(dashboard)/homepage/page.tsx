import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { getLocalized } from "@/lib/get-localized";
import { VisibilityToggle } from "@/components/admin/visibility-toggle";
import { DeleteButton } from "@/components/admin/delete-button";
import { BannerForm } from "./banner-form";
import { FaqForm } from "./faq-form";
import { toggleBannerActive, deleteBanner, toggleFaqActive, deleteFaqItem } from "./actions";

export default async function AdminHomepagePage() {
  const locale = await getAdminLocale();
  const [t, banners, faqItems] = await Promise.all([
    getTranslations({ locale, namespace: "admin.homepage" }),
    prisma.banner.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-[var(--color-ink)]">{t("title")}</h1>
        <p className="mb-6 text-sm text-[var(--color-ink-muted)]">{t("description")}</p>

        <h2 className="mb-4 text-base font-semibold text-[var(--color-ink)]">{t("banners")}</h2>
        <BannerForm />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <div key={banner.id} className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="relative h-32 w-full">
                <Image src={banner.image} alt="" fill sizes="320px" className="object-cover" />
              </div>
              <div className="flex items-center justify-between p-4">
                <p className="text-sm font-medium text-[var(--color-ink)]">
                  {getLocalized(banner.title as Record<string, string>, locale)}
                </p>
                <div className="flex items-center gap-2">
                  <VisibilityToggle id={banner.id} isVisible={banner.isActive} action={toggleBannerActive} />
                  <DeleteButton id={banner.id} action={deleteBanner} />
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <p className="col-span-full rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-ink-soft)]">
              {t("noBanners")}
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold text-[var(--color-ink)]">{t("faq")}</h2>
        <FaqForm />
        <div className="flex flex-col gap-3">
          {faqItems.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">
                  {getLocalized(item.question as Record<string, string>, locale)}
                </p>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  {getLocalized(item.answer as Record<string, string>, locale)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <VisibilityToggle id={item.id} isVisible={item.isActive} action={toggleFaqActive} />
                <DeleteButton id={item.id} action={deleteFaqItem} />
              </div>
            </div>
          ))}
          {faqItems.length === 0 && (
            <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-ink-soft)]">
              {t("noFaq")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
