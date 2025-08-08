export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="h-64 animate-pulse rounded-md bg-muted" />
        <div className="md:col-span-2 h-64 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  )
}
