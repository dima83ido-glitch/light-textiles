"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertCanEdit } from "@/lib/rbac";
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
  while (await prisma.category.findFirst({ where: { slug, NOT: excludeId ? { id: excludeId } : undefined } })) {
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
  await assertCanEdit("categories");
  const name = normalizeLocalized(data.name);
  const slug = await uniqueSlug(slugify(name[routing.defaultLocale]));

  await prisma.category.create({
    data: {
      slug,
      name,
      image: data.image,
      isVisible: data.isVisible,
      parentId: data.parentId || null,
    },
  });
  revalidateTag("categories");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, data: CategoryFormState) {
  await assertCanEdit("categories");
  await prisma.category.update({
    where: { id },
    data: {
      name: normalizeLocalized(data.name),
      parentId: data.parentId || null,
      image: data.image,
      isVisible: data.isVisible,
    },
  });
  revalidateTag("categories");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await assertCanEdit("categories");
  await prisma.category.delete({ where: { id } });
  revalidateTag("categories");
  revalidatePath("/admin/categories");
}

export async function toggleCategoryVisibility(id: string, isVisible: boolean) {
  await assertCanEdit("categories");
  await prisma.category.update({ where: { id }, data: { isVisible } });
  revalidateTag("categories");
  revalidatePath("/admin/categories");
}
