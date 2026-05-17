export function RowSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden px-5 md:px-10">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-64 min-w-40 animate-pulse rounded-md bg-white/10 md:min-w-48" />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-ink">
      <div className="h-[70vh] animate-pulse bg-white/10" />
      <div className="mx-auto -mt-24 max-w-7xl space-y-5 px-5 md:px-10">
        <div className="h-12 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-28 max-w-3xl animate-pulse rounded bg-white/10" />
      </div>
    </main>
  );
}
