import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { requireView } from "@/lib/rbac";
import { AdminPagination } from "@/components/admin/pagination";
import { MediaUploader } from "./media-uploader";
import { MediaGridItem } from "./media-grid-item";

const PAGE_SIZE = 60;

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireView("media");
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const locale = await getAdminLocale();
  const [t, total, assets] = await Promise.all([
    getTranslations({ locale, namespace: "admin.media" }),
    prisma.mediaAsset.count(),
    prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/media" />
    </div>
  );
}
