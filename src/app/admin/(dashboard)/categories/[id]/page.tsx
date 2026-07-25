import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { getLocalized } from "@/lib/get-localized";
import { routing } from "@/i18n/routing";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategory, type CategoryFormState } from "../actions";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getAdminLocale();
  const [t, category, groups] = await Promise.all([
    getTranslations({ locale, namespace: "admin.categories" }),
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { parentId: null, id: { not: id } }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!category) notFound();

  const options = groups.map((g) => ({ id: g.id, label: getLocalized(g.name as Record<string, string>, locale) }));
  const name = category.name as Record<string, string>;

  const initial: Partial<CategoryFormState> = {
    name: Object.fromEntries(routing.locales.map((l) => [l, name[l] ?? ""])),
    parentId: category.parentId,
    image: category.image,
    isVisible: category.isVisible,
  };

  const boundUpdate = updateCategory.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("editCategory")}</h1>
      <CategoryForm initial={initial} parentOptions={options} onSubmit={boundUpdate} />
    </div>
  );
}
