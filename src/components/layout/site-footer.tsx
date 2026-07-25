import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteSettings } from "@/lib/site-settings";
import { getLocalized } from "@/lib/get-localized";
import { FacebookIcon, InstagramIcon } from "@/components/icons/social-icons";

export async function SiteFooter() {
  const [settings, t, tNav, tPages, locale] = await Promise.all([
    getSiteSettings(),
    getTranslations("footer"),
    getTranslations("nav"),
    getTranslations("pages"),
    getLocale(),
  ]);

  const localized = (value: Record<string, string> | undefined) => getLocalized(value, locale);
  const advantagesItems = t.raw("advantagesItems") as string[];

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-strong)] text-sm font-bold text-white">
              LT
            </span>
            <span className="text-base font-semibold text-[var(--color-ink)]">Light Textiles</span>
          </div>
          <p className="mb-5 text-sm leading-relaxed text-[var(--color-ink-muted)]">{t("tagline")}</p>
          <div className="flex items-center gap-2">
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-ink-muted)] shadow-sm transition-colors hover:text-[var(--color-accent-strong)]"
              aria-label="Facebook"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-ink-muted)] shadow-sm transition-colors hover:text-[var(--color-accent-strong)]"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href={`viber://chat?number=${settings.viber}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-ink-muted)] shadow-sm transition-colors hover:text-[var(--color-accent-strong)]"
              aria-label="Viber"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">{t("contacts")}</h3>
          <ul className="space-y-3 text-sm text-[var(--color-ink-muted)]">
            <li>
              <a href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-[var(--color-accent-strong)]">
                <Phone className="h-4 w-4 shrink-0" /> {settings.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-[var(--color-accent-strong)]">
                <Mail className="h-4 w-4 shrink-0" /> {settings.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {localized(settings.address)}
            </li>
            <li className="text-[var(--color-ink-soft)]">{localized(settings.workingHours)}</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">{t("advantages")}</h3>
          <ul className="space-y-3 text-sm text-[var(--color-ink-muted)]">
            {advantagesItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">{t("info")}</h3>
          <ul className="space-y-3 text-sm text-[var(--color-ink-muted)]">
            <li>
              <Link href="/delivery" className="hover:text-[var(--color-accent-strong)]">
                {tNav("delivery")}
              </Link>
            </li>
            <li>
              <Link href="/delivery#returns" className="hover:text-[var(--color-accent-strong)]">
                {tPages("returnsTitle")}
              </Link>
            </li>
            <li>
              <Link href="/custom-order" className="hover:text-[var(--color-accent-strong)]">
                {tNav("customOrder")}
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[var(--color-accent-strong)]">
                {tNav("about")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] px-6 py-5">
        <p className="mx-auto max-w-7xl text-xs text-[var(--color-ink-soft)]">
          © {year} Light Textiles · Лайт Текстиль. {t("rights")}.
        </p>
      </div>
    </footer>
  );
}
