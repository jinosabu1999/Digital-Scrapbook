"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Clock, Download, Edit, Trash2 } from "lucide-react"
import { FavoriteButton } from "@/components/favorite-button"
import { MoodBadge } from "@/components/mood-selector"
import { format } from "date-fns"
import Link from "next/link"

export default function MemoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getMemory, deleteMemory } = useMemories()

  const memoryId = params.id as string
  const memory = getMemory(memoryId)

  if (!memory) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">Memory Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The memory you're looking for doesn't exist or may have been deleted.
          </p>
          <Link href="/memories">
            <Button>Back to Memories</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this memory? This action cannot be undone.")) {
      deleteMemory(memoryId)
      router.push("/memories")
    }
  }

  const handleDownload = () => {
    if (memory.mediaUrl) {
      const link = document.createElement("a")
      link.href = memory.mediaUrl
      link.download = `${memory.title || "memory"}.${memory.type === "photo" ? "jpg" : memory.type === "video" ? "mp4" : "mp3"}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <FavoriteButton memoryId={memory.id} isLiked={memory.isLiked} />
          {memory.mediaUrl && (
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Link href={`/memory/${memory.id}/edit`}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{memory.title || "Untitled Memory"}</CardTitle>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(memory.date), "EEEE, MMMM d, yyyy")}
            </div>
            {memory.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {memory.location}
              </div>
            )}
            {memory.isTimeCapsule && (
              <div className="flex items-center gap-1 text-amber-600">
                <Clock className="h-4 w-4" />
                Time Capsule
                {memory.unlockDate && (
                  <span className="ml-1">(unlocks {format(new Date(memory.unlockDate), "MMM d, yyyy")})</span>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Media Content */}
          {memory.mediaUrl && (
            <div className="rounded-lg overflow-hidden">
              {memory.type === "photo" && (
                <img
                  src={memory.mediaUrl || "/placeholder.svg"}
                  alt={memory.title || "Memory"}
                  className="w-full max-h-96 object-contain bg-muted"
                />
              )}
              {memory.type === "video" && <video src={memory.mediaUrl} controls className="w-full max-h-96" />}
              {memory.type === "audio" && (
                <div className="bg-muted p-6 rounded-lg">
                  <audio src={memory.mediaUrl} controls className="w-full" />
                </div>
              )}
            </div>
          )}

          {/* Text Content */}
          {memory.content && (
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{memory.content}</p>
            </div>
          )}

          {/* Description */}
          {memory.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{memory.description}</p>
            </div>
          )}

          {/* Mood */}
          {memory.mood && (
            <div>
              <h3 className="font-semibold mb-2">Mood</h3>
              <MoodBadge mood={memory.mood} />
            </div>
          )}

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t text-sm text-muted-foreground">
            <p>Created: {format(new Date(memory.createdAt), "PPpp")}</p>
            <p>Last updated: {format(new Date(memory.updatedAt), "PPpp")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
