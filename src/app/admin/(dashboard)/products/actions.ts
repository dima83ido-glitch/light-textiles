"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
  while (
    await prisma.product.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
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

function hasAnyValue(value: Record<string, string>) {
  return Object.values(value).some((v) => v?.trim());
}

export async function createProduct(data: ProductFormState) {
  const name = normalizeLocalized(data.name);
  const slug = await uniqueSlug(slugify(name[routing.defaultLocale]));

  await prisma.product.create({
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
      images: { create: data.images.map((url, i) => ({ url, sortOrder: i })) },
      variants: { create: data.variants.map((v, i) => ({ name: v.name, price: v.price, sortOrder: i })) },
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, data: ProductFormState) {
  const existing = await prisma.product.findUniqueOrThrow({ where: { id } });
  const name = normalizeLocalized(data.name);
  let slug = existing.slug;
  const nameChanged = (existing.name as Record<string, string>)[routing.defaultLocale] !== name[routing.defaultLocale];
  if (nameChanged) {
    slug = await uniqueSlug(slugify(name[routing.defaultLocale]), id);
  }

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.product.update({
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
        images: { create: data.images.map((url, i) => ({ url, sortOrder: i })) },
        variants: { create: data.variants.map((v, i) => ({ name: v.name, price: v.price, sortOrder: i })) },
      },
    }),
  ]);

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}

export async function toggleProductVisibility(id: string, isVisible: boolean) {
  await prisma.product.update({ where: { id }, data: { isVisible } });
  revalidatePath("/admin/products");
}
