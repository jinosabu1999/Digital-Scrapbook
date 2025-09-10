"use client"

import { useMemories } from "@/context/memory-context"
import { PhotoEditor } from "@/components/photo-editor"
import { useRouter } from "next/navigation"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PhotoEditorPage({ params }: { params: { id: string } }) {
  const { getMemory } = useMemories()
  const router = useRouter()
  const memory = getMemory(params.id)

  if (!memory) {
    return (
      <EmptyState
        title="Memory not found"
        description="The memory you're looking for doesn't exist or has been deleted."
        action={
          <Button asChild>
            <Link href="/memories">Back to Memories</Link>
          </Button>
        }
      />
    )
  }

  return <PhotoEditor memory={memory} onClose={() => router.push(`/memory/${memory.id}`)} />
}
