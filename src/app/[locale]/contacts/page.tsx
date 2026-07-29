import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSiteSettings } from "@/lib/site-settings";
import { getLocalized } from "@/lib/get-localized";
import { getAlternates } from "@/lib/seo";
import { ContactForm } from "@/components/home/contact-form";
import { PageHero } from "@/components/ui/page-hero";
import { FacebookIcon, InstagramIcon } from "@/components/icons/social-icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: `${t("contactsTitle")} — Light Textiles`,
    description: t("contactsSubtitle"),
    alternates: getAlternates("/contacts", locale),
  };
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, settings] = await Promise.all([getTranslations("pages"), getSiteSettings()]);

  return (
    <>
      <PageHero title={t("contactsTitle")} subtitle={t("contactsSubtitle")} />

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-2 lg:py-20">
        <div className="flex flex-col gap-4">
          <a
            href={`tel:${settings.phone}`}
            className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm font-medium text-[var(--color-ink)] shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:text-[var(--color-accent-strong)] hover:shadow-[var(--shadow-lifted)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-tint)]">
              <Phone className="h-4 w-4 text-[var(--color-accent-strong)]" />
            </span>
            {settings.phoneDisplay}
          </a>
          <a
            href={`mailto:${settings.email}`}
            className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm font-medium text-[var(--color-ink)] shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:text-[var(--color-accent-strong)] hover:shadow-[var(--shadow-lifted)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-tint)]">
              <Mail className="h-4 w-4 text-[var(--color-accent-strong)]" />
            </span>
            {settings.email}
          </a>
          <a
            href={`viber://chat?number=${settings.viber}`}
            className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm font-medium text-[var(--color-ink)] shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:text-[var(--color-accent-strong)] hover:shadow-[var(--shadow-lifted)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-tint)]">
              <MessageCircle className="h-4 w-4 text-[var(--color-accent-strong)]" />
            </span>
            Viber
          </a>
          <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm font-medium text-[var(--color-ink)] shadow-[var(--shadow-soft)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-tint)]">
              <MapPin className="h-4 w-4 text-[var(--color-accent-strong)]" />
            </span>
            {getLocalized(settings.address, locale)}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] shadow-sm transition-all hover:-translate-y-0.5 hover:text-[var(--color-accent-strong)]"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] shadow-sm transition-all hover:-translate-y-0.5 hover:text-[var(--color-accent-strong)]"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-lifted)] sm:p-8">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
