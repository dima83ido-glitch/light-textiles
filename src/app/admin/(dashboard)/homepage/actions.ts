"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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
  const count = await prisma.banner.count();
  await prisma.banner.create({
    data: {
      title: normalizeLocalized(data.title),
      subtitle: hasAnyValue(data.subtitle) ? normalizeLocalized(data.subtitle) : undefined,
      image: data.image,
      link: data.link || null,
      sortOrder: count,
    },
  });
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
}

export async function toggleBannerActive(id: string, isActive: boolean) {
  await prisma.banner.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
}

export async function deleteBanner(id: string) {
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/homepage");
}

export async function createFaqItem(data: { question: Record<string, string>; answer: Record<string, string> }) {
  const count = await prisma.faqItem.count();
  await prisma.faqItem.create({
    data: {
      question: normalizeLocalized(data.question),
      answer: normalizeLocalized(data.answer),
      sortOrder: count,
    },
  });
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
}

export async function toggleFaqActive(id: string, isActive: boolean) {
  await prisma.faqItem.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
}

export async function deleteFaqItem(id: string) {
  await prisma.faqItem.delete({ where: { id } });
  revalidatePath("/admin/homepage");
}
