"use client"

import { useMemories } from "@/context/memory-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin } from "lucide-react"
import { FavoriteButton } from "@/components/favorite-button"
import { MoodBadge } from "@/components/mood-selector"
import Link from "next/link"
import { format } from "date-fns"

export function RecentMemories() {
  const { memories, loading } = useMemories()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Memories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const recentMemories = memories?.slice(0, 5) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Memories</CardTitle>
      </CardHeader>
      <CardContent>
        {recentMemories.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-muted-foreground mb-4">No memories yet</p>
            <Link href="/upload">
              <Button size="sm">Add Your First Memory</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentMemories.map((memory) => (
              <div key={memory.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                {memory.mediaUrl && memory.type === "photo" && (
                  <img
                    src={memory.mediaUrl || "/placeholder.svg"}
                    alt={memory.title || "Memory"}
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium truncate">{memory.title || "Untitled"}</h4>
                    <FavoriteButton memoryId={memory.id} isLiked={memory.isLiked} className="ml-2" />
                  </div>

                  {memory.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{memory.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(memory.date), "MMM d")}
                    </div>
                    {memory.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {memory.location}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {memory.mood && <MoodBadge mood={memory.mood} className="text-xs" />}
                    {memory.tags && memory.tags.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {memory.tags[0]}
                        {memory.tags.length > 1 && ` +${memory.tags.length - 1}`}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link href="/memories">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View All Memories
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
