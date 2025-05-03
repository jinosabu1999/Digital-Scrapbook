"use client"

import { useState } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FolderHeart, PlusCircle, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { EmptyState } from "@/components/empty-state"

export default function AlbumsPage() {
  const { albums, memories, loading } = useMemories()
  const [searchQuery, setSearchQuery] = useState("")

  // Filter albums based on search query
  const filteredAlbums = albums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (album.description && album.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading albums...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Albums</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search albums..."
              className="pl-8 w-full sm:w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link href="/albums/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Album
            </Link>
          </Button>
        </div>
      </div>

      {albums.length === 0 ? (
        <EmptyState
          title="No Albums Yet"
          description="Create your first album to organize your memories"
          icon={<FolderHeart className="h-12 w-12 text-muted-foreground" />}
          action={
            <Button asChild>
              <Link href="/albums/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Album
              </Link>
            </Button>
          }
        />
      ) : filteredAlbums.length === 0 ? (
        <EmptyState
          title="No matching albums"
          description="Try a different search term"
          action={
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlbums.map((album) => {
            // Find the first memory in the album that has a mediaUrl (for thumbnail)
            const albumMemories = memories.filter((m) => album.memories.includes(m.id))
            const thumbnailMemory = albumMemories.find((m) => m.mediaUrl && m.type === "photo")

            return (
              <Link href={`/albums/${album.id}`} key={album.id}>
                <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                  <div className="aspect-square relative bg-muted">
                    {thumbnailMemory?.mediaUrl ? (
                      <img
                        src={thumbnailMemory.mediaUrl || "/placeholder.svg"}
                        alt={album.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <FolderHeart className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 text-white">
                        <h3 className="font-bold text-lg">{album.title}</h3>
                        <p className="text-sm opacity-90">
                          {albumMemories.length} {albumMemories.length === 1 ? "memory" : "memories"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    {album.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{album.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Created {format(new Date(album.createdAt), "MMMM d, yyyy")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

