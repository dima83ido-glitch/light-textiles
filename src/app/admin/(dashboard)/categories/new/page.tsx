import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { getLocalized } from "@/lib/get-localized";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "../actions";

export default async function NewCategoryPage() {
  const locale = await getAdminLocale();
  const [t] = await Promise.all([getTranslations({ locale, namespace: "admin.categories" })]);
  const groups = await prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" } });
  const options = groups.map((g) => ({ id: g.id, label: getLocalized(g.name as Record<string, string>, locale) }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("newCategory")}</h1>
      <CategoryForm parentOptions={options} onSubmit={createCategory} />
    </div>
  );
}
