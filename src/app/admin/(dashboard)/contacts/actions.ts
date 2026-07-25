"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      phone: data.phone,
      viber: data.viber || null,
      email: data.email,
      workingHours,
      address,
      facebookUrl: data.facebookUrl || null,
      instagramUrl: data.instagramUrl || null,
    },
    update: {
      phone: data.phone,
      viber: data.viber || null,
      email: data.email,
      workingHours,
      address,
      facebookUrl: data.facebookUrl || null,
      instagramUrl: data.instagramUrl || null,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/contacts");
}
