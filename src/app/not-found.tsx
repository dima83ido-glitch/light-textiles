import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

// Root-level fallback for paths that don't even resolve a valid [locale] segment
// (e.g. a bogus top-level path) — Next.js requires this file to exist independently
// of app/[locale]/not-found.tsx, and it can't rely on next-intl request context here,
// so the copy is a plain hardcoded default-locale (Ukrainian) string. Still rendered
// inside the root layout's <html>/<body> (unlike global-error.tsx), so no need to
// repeat those tags here.
export default function RootNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)]">
        <FileQuestion className="h-7 w-7" />
      </div>
      <div>
        <h1 className="mb-2 text-2xl font-semibold text-[var(--color-ink)]">Сторінку не знайдено</h1>
        <p className="text-[var(--color-ink-muted)]">Сторінка, яку ви шукаєте, не існує або була переміщена.</p>
      </div>
      <Link href="/" className={buttonClass()}>
        На головну
      </Link>
    </div>
  );
}
