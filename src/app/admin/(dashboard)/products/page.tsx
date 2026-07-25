import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { store, withCategory } from "@/lib/demo-store";
import { formatPrice } from "@/lib/utils";
import { getAdminLocale } from "@/lib/admin-locale";
import { getLocalized } from "@/lib/get-localized";
import { VisibilityToggle } from "@/components/admin/visibility-toggle";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPagination } from "@/components/admin/pagination";
import { toggleProductVisibility, deleteProduct } from "./actions";

const PAGE_SIZE = 30;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.products" });

  const matching = q
    ? store.products.filter((p) => p.slug.toLowerCase().includes(q.toLowerCase()))
    : store.products;

  const sorted = [...matching].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const total = sorted.length;
  const start = (page - 1) * PAGE_SIZE;
  const products = sorted.slice(start, start + PAGE_SIZE).map((p) => {
    const withRelations = withCategory(p);
    return {
      ...withRelations,
      category: withRelations.category!,
      images: [...p.images].sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 1),
    };
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">{t("title")}</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--color-canvas)] transition-all duration-200 active:scale-95"
        >
          <Plus className="h-4 w-4" /> {t("addProduct")}
        </Link>
      </div>

      <form className="mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder={t("searchPlaceholder")}
          className="w-full max-w-sm rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-accent)]"
        />
      </form>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-left text-[var(--color-ink-soft)]">
              <th className="px-4 py-3 font-medium">{t("columnProduct")}</th>
              <th className="px-4 py-3 font-medium">{t("columnCategory")}</th>
              <th className="px-4 py-3 font-medium">{t("columnPrice")}</th>
              <th className="px-4 py-3 font-medium">{t("columnVisible")}</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const name = getLocalized(product.name as Record<string, string>, locale);
              const catName = getLocalized(product.category.name as Record<string, string>, locale);
              return (
                <tr key={product.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-subtle)]">
                        {product.images[0] && (
                          <Image src={product.images[0].url} alt="" fill sizes="40px" className="object-cover" />
                        )}
                      </div>
                      <Link href={`/admin/products/${product.id}`} className="line-clamp-1 font-medium text-[var(--color-ink)] hover:text-[var(--color-accent-strong)]">
                        {name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-muted)]">{catName}</td>
                  <td className="px-4 py-3 font-medium text-[var(--color-ink)]">{formatPrice(product.discountPrice ?? product.basePrice)} ₴</td>
                  <td className="px-4 py-3">
                    <VisibilityToggle id={product.id} isVisible={product.isVisible} action={toggleProductVisibility} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton id={product.id} action={deleteProduct} />
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--color-ink-soft)]">
                  {t("notFound")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/products" searchParams={{ q }} />
    </div>
  );
}
