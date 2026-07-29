import type { Prisma } from "@prisma/client";

/**
 * Reads a localized string out of a Prisma `Json` field (stored as `{ uk: "...", ru: "...", en: "..." }`).
 * Accepts the raw `Prisma.JsonValue` so call sites don't each need their own
 * `as Record<string, string>` cast to pass a Product/Category/etc. `name`/`description` field in.
 */
export function getLocalized(value: Prisma.JsonValue | null | undefined, locale: string): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const record = value as Record<string, string>;
  return record[locale] ?? record.uk ?? Object.values(record)[0] ?? "";
}
