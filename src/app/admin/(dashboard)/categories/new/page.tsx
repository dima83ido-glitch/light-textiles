import { getTranslations } from "next-intl/server";
import { store } from "@/lib/demo-store";
import { getAdminLocale } from "@/lib/admin-locale";
import { getLocalized } from "@/lib/get-localized";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "../actions";

export default async function NewCategoryPage() {
  const locale = await getAdminLocale();
  const [t] = await Promise.all([getTranslations({ locale, namespace: "admin.categories" })]);
  const groups = [...store.categories].filter((c) => c.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);
  const options = groups.map((g) => ({ id: g.id, label: getLocalized(g.name as Record<string, string>, locale) }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("newCategory")}</h1>
      <CategoryForm parentOptions={options} onSubmit={createCategory} />
    </div>
  );
}
