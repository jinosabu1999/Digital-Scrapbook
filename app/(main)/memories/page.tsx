"use client"

import { useState, useEffect } from "react"
import { useMemories, type MemoryType } from "@/context/memory-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Image, Video, Mic, FileText, Filter, Search, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { EmptyState } from "@/components/empty-state"

export default function MemoriesPage() {
  const { memories, loading } = useMemories()
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMemories, setFilteredMemories] = useState(memories)

  useEffect(() => {
    let result = memories

    // Apply type filter
    if (filter !== "all") {
      result = result.filter((memory) => memory.type === filter)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (memory) =>
          memory.title.toLowerCase().includes(query) ||
          memory.location?.toLowerCase().includes(query) ||
          memory.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          memory.description?.toLowerCase().includes(query),
      )
    }

    setFilteredMemories(result)
  }, [memories, filter, searchQuery])

  const getMemoryTypeIcon = (type: MemoryType) => {
    switch (type) {
      case "photo":
        return <Image className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Mic className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your memories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Memories</h1>
          <Button asChild size="sm" className="md:hidden">
            <Link href="/upload">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search memories..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="photo">Photos</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild className="hidden md:flex">
              <Link href="/upload">
                <Plus className="h-4 w-4 mr-2" />
                Add Memory
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {memories.length === 0 ? (
        <EmptyState
          title="No memories yet"
          description="Start creating memories to see them here"
          action={
            <Button asChild>
              <Link href="/upload">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Memory
              </Link>
            </Button>
          }
        />
      ) : filteredMemories.length === 0 ? (
        <EmptyState
          title="No matching memories"
          description="Try changing your search or filter"
          action={
            <Button
              variant="outline"
              onClick={() => {
                setFilter("all")
                setSearchQuery("")
              }}
            >
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredMemories.map((memory) => (
            <Link href={`/memory/${memory.id}`} key={memory.id}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                <div className="aspect-video relative bg-muted">
                  {memory.mediaUrl ? (
                    memory.type === "photo" ? (
                      <img
                        src={memory.mediaUrl || "/placeholder.svg"}
                        alt={memory.title}
                        className="h-full w-full object-cover"
                      />
                    ) : memory.type === "video" ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                    ) : memory.type === "audio" ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <Mic className="h-12 w-12 text-muted-foreground" />
                      </div>
                    ) : null
                  ) : memory.type === "text" ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      {getMemoryTypeIcon(memory.type)}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {getMemoryTypeIcon(memory.type)}
                      {memory.type.charAt(0).toUpperCase() + memory.type.slice(1)}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg line-clamp-1">{memory.title}</h3>
                  <p className="text-sm text-muted-foreground">{format(new Date(memory.date), "MMMM d, yyyy")}</p>
                  {memory.location && <p className="text-sm text-muted-foreground line-clamp-1">{memory.location}</p>}
                  {memory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {memory.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

