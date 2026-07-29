export default function CatalogRootLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-6 py-12">
      <div className="mb-10 h-9 w-48 rounded-full bg-[var(--color-surface-subtle)]" />
      <div className="flex flex-col gap-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="aspect-[4/3] rounded-[var(--radius-card)] bg-[var(--color-surface-subtle)]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
