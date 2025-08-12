"use client"

import { useMemories } from "@/context/memory-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { MoodBadge } from "@/components/mood-selector"
import { Heart, Image, Video, FileText, Mic, ArrowRight, Plus } from 'lucide-react'
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import type { Memory } from "@/types"

export function RecentMemories() {
  const { memories = [], toggleLike, loading } = useMemories()

  // Ensure memories is always an array
  const safeMemories = Array.isArray(memories) ? memories : []
  
  const recentMemories = safeMemories
    .filter((memory: Memory) => memory && memory.createdAt) // Filter out any null/undefined memories or those without createdAt
    .sort((a: Memory, b: Memory) => {
      if (!a.createdAt || !b.createdAt) return 0 // Should not happen with filter above, but for safety
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    .slice(0, 6)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Image className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Mic className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Memories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (safeMemories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Memories
            <Link href="/memories">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No memories yet"
            description="Start capturing your precious moments."
            actionLabel="Add Memory"
            actionHref="/upload"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Memories
          <Link href="/memories">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentMemories.map((memory: Memory) => (
            <Card key={memory.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(memory.type)}
                    <h3 className="font-medium line-clamp-1">
                      {memory.title || "Untitled Memory"}
                    </h3>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigating to detail page
                      toggleLike(memory.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        memory.isLiked 
                          ? "fill-red-500 text-red-500" 
                          : "text-muted-foreground"
                      }`} 
                    />
                  </Button>
                </div>

                {memory.mediaUrl && memory.type === "photo" && (
                  <div className="aspect-video rounded-md overflow-hidden bg-muted mb-3">
                    <img
                      src={memory.mediaUrl || "/placeholder.svg"}
                      alt={memory.title || "Memory"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {memory.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {memory.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {memory.mood && <MoodBadge mood={memory.mood} />}
                  
                  {memory.tags && memory.tags.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {memory.tags.length} {memory.tags.length === 1 ? 'tag' : 'tags'}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {memory.createdAt 
                      ? formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })
                      : "Unknown date"
                    }
                  </span>
                  <Link 
                    href={`/memory/${memory.id}`}
                    className="text-primary hover:underline"
                  >
                    View
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
