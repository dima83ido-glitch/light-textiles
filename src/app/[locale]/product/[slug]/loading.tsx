export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-6 py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="aspect-square rounded-[var(--radius-card)] bg-[var(--color-surface-subtle)]" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 rounded-full bg-[var(--color-surface-subtle)]" />
          <div className="h-6 w-1/3 rounded-full bg-[var(--color-surface-subtle)]" />
          <div className="h-24 rounded-[var(--radius-card)] bg-[var(--color-surface-subtle)]" />
          <div className="h-12 w-full rounded-full bg-[var(--color-surface-subtle)]" />
        </div>
      </div>
    </div>
  );
}
