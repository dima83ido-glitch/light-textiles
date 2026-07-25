import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { store, countProductsInCategory } from "@/lib/demo-store";
import { getAdminLocale } from "@/lib/admin-locale";
import { getLocalized } from "@/lib/get-localized";
import { VisibilityToggle } from "@/components/admin/visibility-toggle";
import { DeleteButton } from "@/components/admin/delete-button";
import { toggleCategoryVisibility, deleteCategory } from "./actions";

export default async function AdminCategoriesPage() {
  const locale = await getAdminLocale();
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "admin.categories" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const categories = [...store.categories]
    .sort((a, b) => {
      const parentCmp = (a.parentId ?? "").localeCompare(b.parentId ?? "");
      return parentCmp !== 0 ? parentCmp : a.sortOrder - b.sortOrder;
    })
    .map((c) => ({ ...c, _count: { products: countProductsInCategory(c.id) } }));

  const groups = categories.filter((c) => !c.parentId);
  const childrenByParent = new Map<string, typeof categories>();
  for (const c of categories) {
    if (c.parentId) {
      if (!childrenByParent.has(c.parentId)) childrenByParent.set(c.parentId, []);
      childrenByParent.get(c.parentId)!.push(c);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">{t("title")}</h1>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--color-canvas)] transition-all duration-200 active:scale-95"
        >
          <Plus className="h-4 w-4" /> {t("addCategory")}
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.id} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3">
              <Link href={`/admin/categories/${group.id}`} className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent-strong)]">
                {getLocalized(group.name as Record<string, string>, locale)}
              </Link>
              <div className="flex items-center gap-3">
                <VisibilityToggle id={group.id} isVisible={group.isVisible} action={toggleCategoryVisibility} />
                <DeleteButton id={group.id} action={deleteCategory} />
              </div>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {(childrenByParent.get(group.id) ?? []).map((child) => (
                <div key={child.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <Link href={`/admin/categories/${child.id}`} className="text-[var(--color-ink)] hover:text-[var(--color-accent-strong)]">
                    {getLocalized(child.name as Record<string, string>, locale)}
                  </Link>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[var(--color-ink-soft)]">
                      {tCommon("itemsCount", { count: child._count.products })}
                    </span>
                    <VisibilityToggle id={child.id} isVisible={child.isVisible} action={toggleCategoryVisibility} />
                    <DeleteButton id={child.id} action={deleteCategory} />
                  </div>
                </div>
              ))}
              {(childrenByParent.get(group.id) ?? []).length === 0 && (
                <p className="px-4 py-3 text-xs text-[var(--color-ink-soft)]">{t("noSubcategories")}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
