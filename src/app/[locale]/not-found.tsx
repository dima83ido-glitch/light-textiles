import { FileQuestion } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/button";

export default async function LocaleNotFound() {
  const t = await getTranslations("errorPages");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)]">
        <FileQuestion className="h-7 w-7" />
      </div>
      <div>
        <h1 className="mb-2 text-2xl font-semibold text-[var(--color-ink)]">{t("notFoundTitle")}</h1>
        <p className="text-[var(--color-ink-muted)]">{t("notFoundDescription")}</p>
      </div>
      <Link href="/" className={buttonClass()}>
        {t("notFoundCta")}
      </Link>
    </div>
  );
}
