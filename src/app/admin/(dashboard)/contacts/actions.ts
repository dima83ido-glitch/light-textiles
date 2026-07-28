"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertCanEdit } from "@/lib/rbac";
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
  await assertCanEdit("contacts");
  const fields = {
    phone: data.phone,
    viber: data.viber || null,
    email: data.email,
    workingHours: normalizeLocalized(data.workingHours),
    address: normalizeLocalized(data.address),
    facebookUrl: data.facebookUrl || null,
    instagramUrl: data.instagramUrl || null,
  };

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: fields,
    create: { id: "main", ...fields },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/contacts");
}
