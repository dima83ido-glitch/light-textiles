export default function CatalogCategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-6 py-12">
      <div className="mb-10 h-9 w-64 rounded-full bg-[var(--color-surface-subtle)]" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[4/5] rounded-[var(--radius-card)] bg-[var(--color-surface-subtle)]" />
            <div className="h-4 w-3/4 rounded-full bg-[var(--color-surface-subtle)]" />
            <div className="h-4 w-1/3 rounded-full bg-[var(--color-surface-subtle)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
