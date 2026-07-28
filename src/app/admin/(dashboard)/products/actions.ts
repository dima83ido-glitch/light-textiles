"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertCanEdit } from "@/lib/rbac";
import { slugify } from "@/lib/slugify";
import { routing } from "@/i18n/routing";

export type ProductFormState = {
  name: Record<string, string>;
  description: Record<string, string>;
  categoryId: string;
  basePrice: number;
  discountPrice: number | null;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "ON_ORDER";
  isVisible: boolean;
  isFeatured: boolean;
  images: string[];
  variants: { name: string; price: number }[];
};

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || "product";
  let n = 1;
  while (await prisma.product.findFirst({ where: { slug, NOT: excludeId ? { id: excludeId } : undefined } })) {
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

function hasAnyValue(value: Record<string, string>) {
  return Object.values(value).some((v) => v?.trim());
}

export async function createProduct(data: ProductFormState) {
  await assertCanEdit("products");
  const name = normalizeLocalized(data.name);
  const slug = await uniqueSlug(slugify(name[routing.defaultLocale]));

  await prisma.product.create({
    data: {
      slug,
      name,
      description: hasAnyValue(data.description) ? normalizeLocalized(data.description) : undefined,
      basePrice: data.basePrice,
      discountPrice: data.discountPrice,
      currency: "UAH",
      availability: data.availability,
      isVisible: data.isVisible,
      isFeatured: data.isFeatured,
      categoryId: data.categoryId,
      images: { create: data.images.map((url, i) => ({ url, sortOrder: i })) },
      variants: { create: data.variants.map((v, i) => ({ name: v.name, price: v.price, sortOrder: i })) },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function updateProduct(id: string, data: ProductFormState) {
  await assertCanEdit("products");
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  const name = normalizeLocalized(data.name);
  const existingName = existing.name as Record<string, string>;
  const nameChanged = existingName[routing.defaultLocale] !== name[routing.defaultLocale];
  const slug = nameChanged ? await uniqueSlug(slugify(name[routing.defaultLocale]), id) : existing.slug;

  await prisma.product.update({
    where: { id },
    data: {
      slug,
      name,
      description: hasAnyValue(data.description) ? normalizeLocalized(data.description) : undefined,
      basePrice: data.basePrice,
      discountPrice: data.discountPrice,
      availability: data.availability,
      isVisible: data.isVisible,
      isFeatured: data.isFeatured,
      categoryId: data.categoryId,
      images: { deleteMany: {}, create: data.images.map((url, i) => ({ url, sortOrder: i })) },
      variants: { deleteMany: {}, create: data.variants.map((v, i) => ({ name: v.name, price: v.price, sortOrder: i })) },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await assertCanEdit("products");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

export async function toggleProductVisibility(id: string, isVisible: boolean) {
  await assertCanEdit("products");
  await prisma.product.update({ where: { id }, data: { isVisible } });
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}
