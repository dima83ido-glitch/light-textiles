"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertCanEdit } from "@/lib/rbac";
import { routing } from "@/i18n/routing";

function normalizeLocalized(value: Record<string, string>) {
  const fallback = value[routing.defaultLocale]?.trim() || Object.values(value).find((v) => v?.trim()) || "";
  const result: Record<string, string> = {};
  for (const locale of routing.locales) {
    result[locale] = value[locale]?.trim() || fallback;
  }
  return result;
}

export async function updateGlobalSeo(data: {
  metaTitle: Record<string, string>;
  metaDescription: Record<string, string>;
}) {
  await assertCanEdit("seo");
  const metaTitle = normalizeLocalized(data.metaTitle);
  const metaDescription = normalizeLocalized(data.metaDescription);

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: { metaTitle, metaDescription },
    create: {
      id: "main",
      phone: "",
      email: "",
      workingHours: Object.fromEntries(routing.locales.map((l) => [l, ""])),
      metaTitle,
      metaDescription,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/seo");
}
