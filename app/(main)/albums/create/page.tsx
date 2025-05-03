import { Suspense } from "react"
import AlbumCreateContent from "./album-create-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function AlbumCreatePage() {
  return (
    <Suspense fallback={<AlbumCreateSkeleton />}>
      <AlbumCreateContent />
    </Suspense>
  )
}

function AlbumCreateSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4">
      <Skeleton className="h-10 w-64 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  )
}

