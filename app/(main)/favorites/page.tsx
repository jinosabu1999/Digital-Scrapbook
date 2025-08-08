"use client"

import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/empty-state"
import { Heart, Image, Video, Mic, FileText, Calendar, MapPin, Loader2 } from 'lucide-react'
import Link from "next/link"
import { format } from "date-fns"
import { MoodBadge } from "@/components/mood-selector"

export default function FavoritesPage() {
  const { memories, loading } = useMemories()
  const favoriteMemories = memories.filter(memory => memory.isLiked)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your favorites...</p>
        </div>
      </div>
    )
  }

  if (favoriteMemories.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Favorites</h1>
        </div>
        <EmptyState
          title="No favorites yet"
          description="Start adding memories to your favorites by clicking the heart icon on any memory"
          action={
            <Button asChild>
              <Link href="/memories">
                <Heart className="mr-2 h-4 w-4" />
                Browse Memories
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Favorites</h1>
          <p className="text-muted-foreground mt-1">
            {favoriteMemories.length} favorite {favoriteMemories.length === 1 ? 'memory' : 'memories'}
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">Add Memory</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteMemories.map((memory) => (
          <Link href={`/memory/${memory.id}`} key={memory.id}>
            <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
                  {memory.mediaUrl && (memory.type === "photo" || memory.type === "video") ? (
                    <>
                      <img
                        src={memory.mediaUrl || "/placeholder.svg"}
                        alt={memory.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {memory.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Video className="h-12 w-12 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {memory.type === "audio" && <Mic className="h-16 w-16 text-muted-foreground" />}
                      {memory.type === "text" && <FileText className="h-16 w-16 text-muted-foreground" />}
                      {memory.type === "photo" && <Image className="h-16 w-16 text-muted-foreground" />}
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Heart className="h-5 w-5 text-red-500 fill-current drop-shadow-sm" />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {memory.title}
                      </h3>
                      {memory.mood && <MoodBadge mood={memory.mood} />}
                    </div>
                    {memory.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {memory.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(memory.date), "MMM d, yyyy")}</span>
                    </div>
                    {memory.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{memory.location}</span>
                      </div>
                    )}
                  </div>

                  {memory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {memory.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {memory.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{memory.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
