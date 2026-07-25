"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { store, genId } from "@/lib/demo-store";
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

function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || "product";
  let n = 1;
  while (store.products.some((p) => p.slug === slug && p.id !== excludeId)) {
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
  const slug = uniqueSlug(slugify(name[routing.defaultLocale]));
  const id = genId();
  const now = new Date();

  store.products.push({
    id,
    slug,
    name,
    description: hasAnyValue(data.description) ? normalizeLocalized(data.description) : null,
    basePrice: data.basePrice,
    discountPrice: data.discountPrice,
    currency: "UAH",
    availability: data.availability,
    isVisible: data.isVisible,
    isFeatured: data.isFeatured,
    sourceUrl: null,
    metaTitle: null,
    metaDescription: null,
    categoryId: data.categoryId,
    images: data.images.map((url, i) => ({ id: genId(), productId: id, url, alt: null, sortOrder: i })),
    variants: data.variants.map((v, i) => ({ id: genId(), productId: id, name: v.name, price: v.price, sortOrder: i })),
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, data: ProductFormState) {
  const existing = store.products.find((p) => p.id === id);
  if (!existing) throw new Error("Product not found");

  const name = normalizeLocalized(data.name);
  let slug = existing.slug;
  const nameChanged = existing.name[routing.defaultLocale] !== name[routing.defaultLocale];
  if (nameChanged) {
    slug = uniqueSlug(slugify(name[routing.defaultLocale]), id);
  }

  existing.slug = slug;
  existing.name = name;
  existing.description = hasAnyValue(data.description) ? normalizeLocalized(data.description) : null;
  existing.basePrice = data.basePrice;
  existing.discountPrice = data.discountPrice;
  existing.availability = data.availability;
  existing.isVisible = data.isVisible;
  existing.isFeatured = data.isFeatured;
  existing.categoryId = data.categoryId;
  existing.images = data.images.map((url, i) => ({ id: genId(), productId: id, url, alt: null, sortOrder: i }));
  existing.variants = data.variants.map((v, i) => ({ id: genId(), productId: id, name: v.name, price: v.price, sortOrder: i }));
  existing.updatedAt = new Date();

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  store.products = store.products.filter((p) => p.id !== id);
  revalidatePath("/admin/products");
}

export async function toggleProductVisibility(id: string, isVisible: boolean) {
  const product = store.products.find((p) => p.id === id);
  if (!product) return;
  product.isVisible = isVisible;
  product.updatedAt = new Date();
  revalidatePath("/admin/products");
}
