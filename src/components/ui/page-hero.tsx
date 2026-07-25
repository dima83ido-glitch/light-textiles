export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-tint)]">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--color-ink-muted)]">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
