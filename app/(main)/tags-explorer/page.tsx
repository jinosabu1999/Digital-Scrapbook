"use client"

import { useState } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tag, Plus, Loader2, AlertCircle, Image, Video, Mic, FileText, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export default function TagsExplorerPage() {
  const { memories, loading } = useMemories()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Get all unique tags from memories
  const allTags = [...new Set(memories.flatMap((memory) => memory.tags))].sort()

  // Filter tags based on search
  const filteredTags = searchQuery
    ? allTags.filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    : allTags

  // Get memories for selected tag
  const memoriesWithSelectedTag = selectedTag ? memories.filter((memory) => memory.tags.includes(selectedTag)) : []

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag === selectedTag ? null : tag)
  }

  const getMemoryTypeIcon = (type: string) => {
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
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading memories...</p>
        </div>
      </div>
    )
  }

  if (allTags.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Tags Explorer</h1>
        <EmptyState
          title="No tags found"
          description="Add tags to your memories to organize and explore them better"
          action={
            <Button asChild>
              <Link href="/upload">
                <Plus className="h-4 w-4 mr-2" />
                Add Memory with Tags
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Tags Explorer</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Explore Your Memories by Tags</AlertTitle>
        <AlertDescription>
          Browse your memories organized by tags. Select a tag to see all memories with that tag.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Browse memories by tags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto p-2">
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag) => {
                    const count = memories.filter((m) => m.tags.includes(tag)).length
                    return (
                      <Badge
                        key={tag}
                        variant={selectedTag === tag ? "default" : "outline"}
                        className="cursor-pointer py-1 px-2"
                        onClick={() => handleTagSelect(tag)}
                      >
                        {tag} ({count})
                      </Badge>
                    )
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground w-full">
                    No tags found matching your search
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{selectedTag ? `Memories tagged with "${selectedTag}"` : "Select a Tag"}</CardTitle>
              <CardDescription>
                {selectedTag
                  ? `${memoriesWithSelectedTag.length} memories found`
                  : "Click on a tag to view related memories"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTag ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {memoriesWithSelectedTag.map((memory) => (
                    <Link href={`/memory/${memory.id}`} key={memory.id}>
                      <Card className="hover:bg-accent/50 transition-colors h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            {memory.mediaUrl && (memory.type === "photo" || memory.type === "video") ? (
                              <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                                <img
                                  src={memory.mediaUrl || "/placeholder.svg"}
                                  alt={memory.title}
                                  className="h-full w-full object-cover"
                                />
                                {memory.type === "video" && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <Video className="h-8 w-8 text-white" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                {memory.type === "audio" && <Mic className="h-8 w-8 text-muted-foreground" />}
                                {memory.type === "text" && <FileText className="h-8 w-8 text-muted-foreground" />}
                                {memory.type === "photo" && <Image className="h-8 w-8 text-muted-foreground" />}
                                {memory.type === "video" && <Video className="h-8 w-8 text-muted-foreground" />}
                              </div>
                            )}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{memory.title}</h4>
                                <div className="flex items-center space-x-1">{getMemoryTypeIcon(memory.type)}</div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(memory.date), "MMMM d, yyyy")}
                              </p>
                              {memory.location && <p className="text-sm text-muted-foreground">{memory.location}</p>}
                              <div className="flex flex-wrap gap-1 pt-1">
                                {memory.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant={tag === selectedTag ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Tag</h3>
                  <p className="text-muted-foreground max-w-md">
                    Choose a tag from the list to view all memories with that tag.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

