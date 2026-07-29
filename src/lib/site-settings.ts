import { cache } from "react";
import { prisma } from "@/lib/prisma";

function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^380/, "0");
  const match = digits.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}-${match[4]}` : phone;
}

export const FALLBACK_SITE_SETTINGS = {
  phone: "0977050575",
  phoneDisplay: "097-705-05-75",
  viber: "+380977050575",
  email: "light-textiles@ukr.net",
  workingHours: {
    uk: "Пн–Пт 10:00–18:00",
    en: "Mon–Fri 10:00 AM–6:00 PM",
    ru: "Пн–Пт 10:00–18:00",
  },
  address: {
    uk: "Виробництво: м. Радомишль, Житомирська область",
    en: "Production: Radomyshl, Zhytomyr region, Ukraine",
    ru: "Производство: г. Радомышль, Житомирская область",
  },
  facebookUrl: "https://www.facebook.com/lighttextiles.com.ua/",
  instagramUrl: "https://www.instagram.com/light_textiles.com.ua/",
};

// Wrapped in React's cache() so the handful of components that all render on every page
// (header, footer, contact section) share one Prisma call per request instead of one each.
export const getSiteSettings = cache(async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings) return FALLBACK_SITE_SETTINGS;

  return {
    phone: settings.phone,
    phoneDisplay: formatPhoneDisplay(settings.phone),
    viber: settings.viber ?? FALLBACK_SITE_SETTINGS.viber,
    email: settings.email,
    workingHours: settings.workingHours as Record<string, string>,
    address: (settings.address as Record<string, string> | null) ?? FALLBACK_SITE_SETTINGS.address,
    facebookUrl: settings.facebookUrl ?? FALLBACK_SITE_SETTINGS.facebookUrl,
    instagramUrl: settings.instagramUrl ?? FALLBACK_SITE_SETTINGS.instagramUrl,
  };
});
