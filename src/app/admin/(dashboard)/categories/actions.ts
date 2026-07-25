"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { routing } from "@/i18n/routing";

export type CategoryFormState = {
  name: Record<string, string>;
  parentId: string | null;
  image: string | null;
  isVisible: boolean;
};

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || "category";
  let n = 1;
  while (
    await prisma.category.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })
  ) {
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
  const slug = await uniqueSlug(slugify(name[routing.defaultLocale]));
  await prisma.category.create({
    data: {
      slug,
      name,
      parentId: data.parentId || null,
      image: data.image,
      isVisible: data.isVisible,
    },
  });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, data: CategoryFormState) {
  await prisma.category.update({
    where: { id },
    data: {
      name: normalizeLocalized(data.name),
      parentId: data.parentId || null,
      image: data.image,
      isVisible: data.isVisible,
    },
  });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export async function toggleCategoryVisibility(id: string, isVisible: boolean) {
  await prisma.category.update({ where: { id }, data: { isVisible } });
  revalidatePath("/admin/categories");
}
