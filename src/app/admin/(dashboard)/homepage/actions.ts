"use server";

import { revalidatePath } from "next/cache";
import { store, genId } from "@/lib/demo-store";
import { routing } from "@/i18n/routing";

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

export async function createBanner(data: {
  title: Record<string, string>;
  subtitle: Record<string, string>;
  image: string;
  link: string;
}) {
  store.banners.push({
    id: genId(),
    title: normalizeLocalized(data.title),
    subtitle: hasAnyValue(data.subtitle) ? normalizeLocalized(data.subtitle) : null,
    image: data.image,
    link: data.link || null,
    sortOrder: store.banners.length,
    isActive: true,
    createdAt: new Date(),
  });
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
}

export async function toggleBannerActive(id: string, isActive: boolean) {
  const banner = store.banners.find((b) => b.id === id);
  if (!banner) return;
  banner.isActive = isActive;
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
}

export async function deleteBanner(id: string) {
  store.banners = store.banners.filter((b) => b.id !== id);
  revalidatePath("/admin/homepage");
}

export async function createFaqItem(data: { question: Record<string, string>; answer: Record<string, string> }) {
  store.faqItems.push({
    id: genId(),
    question: normalizeLocalized(data.question),
    answer: normalizeLocalized(data.answer),
    sortOrder: store.faqItems.length,
    isActive: true,
  });
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
}

export async function toggleFaqActive(id: string, isActive: boolean) {
  const item = store.faqItems.find((f) => f.id === id);
  if (!item) return;
  item.isActive = isActive;
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
}

export async function deleteFaqItem(id: string) {
  store.faqItems = store.faqItems.filter((f) => f.id !== id);
  revalidatePath("/admin/homepage");
}
