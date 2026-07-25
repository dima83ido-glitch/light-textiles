import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { getLocalized } from "@/lib/get-localized";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const locale = await getAdminLocale();
  const [t, categories] = await Promise.all([
    getTranslations({ locale, namespace: "admin.products" }),
    prisma.category.findMany({
      where: { parentId: { not: null } },
      orderBy: { sortOrder: "asc" },
      include: { parent: true },
    }),
  ]);

  const options = categories.map((c) => ({
    id: c.id,
    label: `${getLocalized(c.parent?.name as Record<string, string> | undefined, locale)} / ${getLocalized(c.name as Record<string, string>, locale)}`,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("newProduct")}</h1>
      <ProductForm categories={options} onSubmit={createProduct} />
    </div>
  );
}
