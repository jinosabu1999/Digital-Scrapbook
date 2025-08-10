"use client"

import { useState } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Tag, MapPin, Clock } from "lucide-react"
import { FavoriteButton } from "@/components/favorite-button"
import { MoodBadge } from "@/components/mood-selector"
import Link from "next/link"
import { format } from "date-fns"

export default function MemoriesPage() {
  const { memories, loading } = useMemories()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your memories...</p>
        </div>
      </div>
    )
  }

  const filteredMemories =
    memories?.filter((memory) => {
      if (!memory) return false

      const matchesSearch =
        !searchQuery ||
        memory.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTag = !selectedTag || memory.tags?.includes(selectedTag)

      return matchesSearch && matchesTag
    }) || []

  const allTags = Array.from(new Set(memories?.flatMap((memory) => memory.tags || []) || []))

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">My Memories</h1>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Memories Grid */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">No memories found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedTag
              ? "Try adjusting your search or filter criteria"
              : "Start creating your first memory!"}
          </p>
          <Link href="/upload">
            <Button>Add Your First Memory</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map((memory) => (
            <Card key={memory.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg line-clamp-2 flex-1">{memory.title || "Untitled Memory"}</h3>
                  <FavoriteButton memoryId={memory.id} isLiked={memory.isLiked} className="ml-2" />
                </div>

                {memory.mediaUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    {memory.type === "photo" && (
                      <img
                        src={memory.mediaUrl || "/placeholder.svg"}
                        alt={memory.title || "Memory"}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    {memory.type === "video" && (
                      <video src={memory.mediaUrl} className="w-full h-48 object-cover" controls />
                    )}
                    {memory.type === "audio" && (
                      <div className="bg-muted p-4 rounded-lg">
                        <audio src={memory.mediaUrl} controls className="w-full" />
                      </div>
                    )}
                  </div>
                )}

                {memory.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{memory.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(memory.date), "MMM d, yyyy")}
                  </div>

                  {memory.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {memory.location}
                    </div>
                  )}

                  {memory.isTimeCapsule && (
                    <div className="flex items-center text-sm text-amber-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Time Capsule
                      {memory.unlockDate && (
                        <span className="ml-1">(unlocks {format(new Date(memory.unlockDate), "MMM d, yyyy")})</span>
                      )}
                    </div>
                  )}

                  {memory.mood && (
                    <div className="flex items-center">
                      <MoodBadge mood={memory.mood} />
                    </div>
                  )}

                  {memory.tags && memory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {memory.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {memory.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{memory.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t">
                  <Link href={`/memory/${memory.id}`}>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
