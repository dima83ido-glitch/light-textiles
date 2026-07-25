import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { MediaUploader } from "./media-uploader";
import { MediaGridItem } from "./media-grid-item";

export default async function AdminMediaPage() {
  const locale = await getAdminLocale();
  const [t, assets] = await Promise.all([
    getTranslations({ locale, namespace: "admin.media" }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("title")}</h1>
      <MediaUploader />

      {assets.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-10 text-center text-sm text-[var(--color-ink-soft)]">
          {t("empty")}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {assets.map((asset) => (
            <MediaGridItem key={asset.id} id={asset.id} url={asset.url} filename={asset.filename} />
          ))}
        </div>
      )}
    </div>
  );
}
