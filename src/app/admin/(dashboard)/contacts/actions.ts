"use server";

import { revalidatePath } from "next/cache";
import { store } from "@/lib/demo-store";
import { routing } from "@/i18n/routing";

export type ContactsFormState = {
  phone: string;
  viber: string;
  email: string;
  workingHours: Record<string, string>;
  address: Record<string, string>;
  facebookUrl: string;
  instagramUrl: string;
};

function normalizeLocalized(value: Record<string, string>) {
  const fallback = value[routing.defaultLocale]?.trim() || Object.values(value).find((v) => v?.trim()) || "";
  const result: Record<string, string> = {};
  for (const locale of routing.locales) {
    result[locale] = value[locale]?.trim() || fallback;
  }
  return result;
}

export async function updateSiteSettings(data: ContactsFormState) {
  const workingHours = normalizeLocalized(data.workingHours);
  const address = normalizeLocalized(data.address);

  const fields = {
    phone: data.phone,
    viber: data.viber || null,
    email: data.email,
    workingHours,
    address,
    facebookUrl: data.facebookUrl || null,
    instagramUrl: data.instagramUrl || null,
  };

  if (store.siteSettings) {
    Object.assign(store.siteSettings, fields, { updatedAt: new Date() });
  } else {
    store.siteSettings = {
      id: "main",
      ...fields,
      heroTitle: null,
      heroSubtitle: null,
      heroImage: null,
      aboutText: null,
      deliveryText: null,
      footerText: null,
      metaTitle: null,
      metaDescription: null,
      updatedAt: new Date(),
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/contacts");
}
