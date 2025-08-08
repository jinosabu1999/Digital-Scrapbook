"use client"

import { useMemories } from "@/context/memory-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function FeaturedAlbums() {
  const { albums, memories } = useMemories()

  // Sort albums by creation date (newest first)
  const sortedAlbums = [...albums].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Limit to 3 albums
  const displayAlbums = sortedAlbums.slice(0, 3)

  if (albums.length === 0) {
    return (
      <EmptyState
        title="No albums yet"
        description="Create your first album to organize your memories"
        action={
          <Button asChild size="sm">
            <Link href="/albums/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Album
            </Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {displayAlbums.map((album) => {
        // Find the first memory in the album that has a mediaUrl (for thumbnail)
        const albumMemories = memories.filter((m) => album.memories.includes(m.id))
        const thumbnailMemory = albumMemories.find((m) => m.mediaUrl && m.type === "photo")

        return (
          <Link
            href={`/albums/${album.id}`}
            key={album.id}
            className="flex items-center space-x-4 rounded-md p-2 hover:bg-accent/50 transition-colors"
          >
            <Avatar className="h-12 w-12 rounded-md">
              {thumbnailMemory?.mediaUrl ? <AvatarImage src={thumbnailMemory.mediaUrl} alt={album.title} /> : null}
              <AvatarFallback className="rounded-md">{album.title.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{album.title}</p>
              <p className="text-sm text-muted-foreground">
                {albumMemories.length} {albumMemories.length === 1 ? "memory" : "memories"}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
