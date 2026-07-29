import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { routing } from "@/i18n/routing";

const LOCALE_LABEL: Record<string, string> = { uk: "укр", en: "eng", ru: "рос" };

/** Shared across every admin form (category/product/account/staff/warehouse/etc.) —
 * import instead of redeclaring, so the admin input style stays in exactly one place. */
export const adminInputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-accent)]";
const labelClass = "mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink-muted)]";

export function LocalizedTextField<T extends FieldValues>({
  label,
  register,
  name,
  required,
  multiline,
  rows = 4,
}: {
  label: string;
  register: UseFormRegister<T>;
  name: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {routing.locales.map((locale) => {
        const fieldName = `${name}.${locale}` as Path<T>;
        const isRequired = required && locale === routing.defaultLocale;
        return (
          <div key={locale}>
            <label className={labelClass}>
              {label}
              <span className="uppercase text-[var(--color-ink-soft)]">({LOCALE_LABEL[locale] ?? locale})</span>
            </label>
            {multiline ? (
              <textarea rows={rows} className={adminInputClass} required={isRequired} {...register(fieldName)} />
            ) : (
              <input className={adminInputClass} required={isRequired} {...register(fieldName)} />
            )}
          </div>
        );
      })}
    </div>
  );
}
