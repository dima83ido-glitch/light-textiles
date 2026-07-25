"use server";

import { revalidatePath } from "next/cache";
import { store } from "@/lib/demo-store";
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
  const metaTitle = normalizeLocalized(data.metaTitle);
  const metaDescription = normalizeLocalized(data.metaDescription);

  if (store.siteSettings) {
    store.siteSettings.metaTitle = metaTitle;
    store.siteSettings.metaDescription = metaDescription;
    store.siteSettings.updatedAt = new Date();
  } else {
    store.siteSettings = {
      id: "main",
      phone: "",
      viber: null,
      email: "",
      workingHours: Object.fromEntries(routing.locales.map((l) => [l, ""])),
      address: null,
      facebookUrl: null,
      instagramUrl: null,
      heroTitle: null,
      heroSubtitle: null,
      heroImage: null,
      aboutText: null,
      deliveryText: null,
      footerText: null,
      metaTitle,
      metaDescription,
      updatedAt: new Date(),
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/seo");
}
