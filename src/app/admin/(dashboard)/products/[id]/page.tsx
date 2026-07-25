import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { store } from "@/lib/demo-store";
import { getAdminLocale } from "@/lib/admin-locale";
import { getLocalized } from "@/lib/get-localized";
import { routing } from "@/i18n/routing";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct, type ProductFormState } from "../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getAdminLocale();

  const [t] = await Promise.all([getTranslations({ locale, namespace: "admin.products" })]);
  const found = store.products.find((p) => p.id === id);
  const product = found
    ? {
        ...found,
        images: [...found.images].sort((a, b) => a.sortOrder - b.sortOrder),
        variants: [...found.variants].sort((a, b) => a.sortOrder - b.sortOrder),
      }
    : null;
  const categories = [...store.categories]
    .filter((c) => c.parentId !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({ ...c, parent: c.parentId ? store.categories.find((p) => p.id === c.parentId) : undefined }));

  if (!product) notFound();

  const options = categories.map((c) => ({
    id: c.id,
    label: `${getLocalized(c.parent?.name as Record<string, string> | undefined, locale)} / ${getLocalized(c.name as Record<string, string>, locale)}`,
  }));

  const name = product.name as Record<string, string>;
  const description = (product.description as Record<string, string> | null) ?? {};

  const initial: Partial<ProductFormState> = {
    name: Object.fromEntries(routing.locales.map((l) => [l, name[l] ?? ""])),
    description: Object.fromEntries(routing.locales.map((l) => [l, description[l] ?? ""])),
    categoryId: product.categoryId,
    basePrice: product.basePrice,
    discountPrice: product.discountPrice,
    availability: product.availability,
    isVisible: product.isVisible,
    isFeatured: product.isFeatured,
    images: product.images.map((i) => i.url),
    variants: product.variants.map((v) => ({ name: v.name, price: v.price })),
  };

  const boundUpdate = updateProduct.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("editProduct")}</h1>
      <ProductForm categories={options} initial={initial} onSubmit={boundUpdate} />
    </div>
  );
}
