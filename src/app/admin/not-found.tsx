import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { getAdminLocale, getAdminMessages } from "@/lib/admin-locale";
import { buttonClass } from "@/components/ui/button";

// Admin uses a cookie-based locale (not next-intl's URL routing/request config), so this
// reads messages the same way admin pages already do rather than via getTranslations().
export default async function AdminNotFound() {
  const locale = await getAdminLocale();
  const messages = await getAdminMessages(locale);
  const t = messages.errorPages;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)]">
        <FileQuestion className="h-7 w-7" />
      </div>
      <div>
        <h1 className="mb-2 text-2xl font-semibold text-[var(--color-ink)]">{t.notFoundTitle}</h1>
        <p className="text-[var(--color-ink-muted)]">{t.notFoundDescription}</p>
      </div>
      <Link href="/admin" className={buttonClass()}>
        {t.notFoundCta}
      </Link>
    </div>
  );
}
