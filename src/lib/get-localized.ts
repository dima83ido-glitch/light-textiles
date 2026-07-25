export function getLocalized(value: Record<string, string> | null | undefined, locale: string): string {
  if (!value) return "";
  return value[locale] ?? value.uk ?? Object.values(value)[0] ?? "";
}
