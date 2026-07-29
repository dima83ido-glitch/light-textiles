import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getSiteSettings } from "@/lib/site-settings";
import { getLocalized } from "@/lib/get-localized";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "./contact-form";

export async function ContactSection() {
  const [settings, t, locale] = await Promise.all([
    getSiteSettings(),
    getTranslations("home"),
    getLocale(),
  ]);

  const localized = (value: Record<string, string>) => getLocalized(value, locale);

  return (
    <section className="bg-[var(--color-surface-tint)] py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2">
        <Reveal direction="left">
          <h2 className="mb-5 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {t("contactTitle")}
          </h2>
          <p className="mb-8 max-w-md text-base leading-relaxed text-[var(--color-ink-muted)]">
            {t("contactSubtitle")}
          </p>

          <div className="flex flex-col gap-4">
            <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-sm font-medium text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent-strong)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm">
                <Phone className="h-4 w-4 text-[var(--color-accent-strong)]" />
              </span>
              {settings.phoneDisplay}
            </a>
            <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-sm font-medium text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent-strong)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm">
                <Mail className="h-4 w-4 text-[var(--color-accent-strong)]" />
              </span>
              {settings.email}
            </a>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-ink)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm">
                <MapPin className="h-4 w-4 text-[var(--color-accent-strong)]" />
              </span>
              {localized(settings.address)}
            </div>
          </div>
        </Reveal>

        <Reveal direction="right" delay={0.1} className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-lifted)] sm:p-8">
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
