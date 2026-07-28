import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { getLocalized } from "@/lib/get-localized";
import { getSession } from "@/lib/session";
import { canEdit } from "@/lib/rbac";
import { routing } from "@/i18n/routing";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct, type ProductFormState } from "../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getAdminLocale();

  const [t, session, found, categories] = await Promise.all([
    getTranslations({ locale, namespace: "admin.products" }),
    getSession(),
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({
      where: { parentId: { not: null } },
      orderBy: { sortOrder: "asc" },
      include: { parent: true },
    }),
  ]);

  if (!session || !canEdit(session.role, "products")) redirect("/admin/products");
  if (!found) notFound();

  const options = categories.map((c) => ({
    id: c.id,
    label: `${getLocalized(c.parent?.name as Record<string, string> | undefined, locale)} / ${getLocalized(c.name as Record<string, string>, locale)}`,
  }));

  const name = found.name as Record<string, string>;
  const description = (found.description as Record<string, string> | null) ?? {};

  const initial: Partial<ProductFormState> = {
    name: Object.fromEntries(routing.locales.map((l) => [l, name[l] ?? ""])),
    description: Object.fromEntries(routing.locales.map((l) => [l, description[l] ?? ""])),
    categoryId: found.categoryId,
    basePrice: found.basePrice,
    discountPrice: found.discountPrice,
    availability: found.availability,
    isVisible: found.isVisible,
    isFeatured: found.isFeatured,
    images: found.images.map((i) => i.url),
    variants: found.variants.map((v) => ({ name: v.name, price: v.price })),
  };

  const boundUpdate = updateProduct.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("editProduct")}</h1>
      <ProductForm categories={options} initial={initial} onSubmit={boundUpdate} />
    </div>
  );
}
