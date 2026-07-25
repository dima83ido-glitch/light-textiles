"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { store, genId } from "@/lib/demo-store";
import { slugify } from "@/lib/slugify";
import { routing } from "@/i18n/routing";

export type CategoryFormState = {
  name: Record<string, string>;
  parentId: string | null;
  image: string | null;
  isVisible: boolean;
};

function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || "category";
  let n = 1;
  while (store.categories.some((c) => c.slug === slug && c.id !== excludeId)) {
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}

function normalizeLocalized(value: Record<string, string>) {
  const fallback = value[routing.defaultLocale]?.trim() || Object.values(value).find((v) => v?.trim()) || "";
  const result: Record<string, string> = {};
  for (const locale of routing.locales) {
    result[locale] = value[locale]?.trim() || fallback;
  }
  return result;
}

export async function createCategory(data: CategoryFormState) {
  const name = normalizeLocalized(data.name);
  const slug = uniqueSlug(slugify(name[routing.defaultLocale]));
  const now = new Date();

  store.categories.push({
    id: genId(),
    slug,
    name,
    description: null,
    image: data.image,
    sortOrder: 0,
    isVisible: data.isVisible,
    metaTitle: null,
    metaDescription: null,
    parentId: data.parentId || null,
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, data: CategoryFormState) {
  const category = store.categories.find((c) => c.id === id);
  if (!category) throw new Error("Category not found");
  category.name = normalizeLocalized(data.name);
  category.parentId = data.parentId || null;
  category.image = data.image;
  category.isVisible = data.isVisible;
  category.updatedAt = new Date();
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  store.categories = store.categories.filter((c) => c.id !== id);
  revalidatePath("/admin/categories");
}

export async function toggleCategoryVisibility(id: string, isVisible: boolean) {
  const category = store.categories.find((c) => c.id === id);
  if (!category) return;
  category.isVisible = isVisible;
  category.updatedAt = new Date();
  revalidatePath("/admin/categories");
}
