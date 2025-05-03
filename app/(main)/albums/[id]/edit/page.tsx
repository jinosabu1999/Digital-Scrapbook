"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Search, Image, FolderHeart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { EmptyState } from "@/components/empty-state"
import Link from "next/link"

export default function EditAlbumPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { memories, getAlbum, updateAlbum, addMemoryToAlbum, removeMemoryFromAlbum, loading } = useMemories()

  const [album, setAlbum] = useState(getAlbum(params.id))
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Update album if it changes in context
    const currentAlbum = getAlbum(params.id)
    if (currentAlbum) {
      setAlbum(currentAlbum)
      setSelectedMemories(currentAlbum.memories)
    }
  }, [getAlbum, params.id])

  // Filter memories based on search query
  const filteredMemories = memories.filter(
    (memory) =>
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (memory.location && memory.location.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading album...</p>
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <EmptyState
        title="Album not found"
        description="The album you're trying to edit doesn't exist or has been deleted."
        action={
          <Button asChild>
            <Link href="/albums">Back to Albums</Link>
          </Button>
        }
      />
    )
  }

  const handleToggleMemory = (memoryId: string) => {
    setSelectedMemories((prev) =>
      prev.includes(memoryId) ? prev.filter((id) => id !== memoryId) : [...prev, memoryId],
    )
  }

  const handleSave = async () => {
    setError(null)

    if (selectedMemories.length === 0) {
      setError("Please select at least one memory for your album")
      return
    }

    setIsSaving(true)

    try {
      // Add new memories
      const newMemories = selectedMemories.filter((id) => !album.memories.includes(id))
      newMemories.forEach((id) => {
        addMemoryToAlbum(id, params.id)
      })

      // Remove memories that were deselected
      const removedMemories = album.memories.filter((id) => !selectedMemories.includes(id))
      removedMemories.forEach((id) => {
        removeMemoryFromAlbum(id, params.id)
      })

      toast({
        title: "Success!",
        description: "Album updated successfully!",
      })

      // Redirect to the album detail page
      router.push(`/albums/${params.id}`)
    } catch (err) {
      console.error("Error updating album:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Edit Album: {album.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected Memories</CardTitle>
              <CardDescription>
                {selectedMemories.length} {selectedMemories.length === 1 ? "memory" : "memories"} selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {selectedMemories.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <FolderHeart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p>No memories selected yet</p>
                  <p className="text-sm">Select memories from the list on the right</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {selectedMemories.map((id) => {
                    const memory = memories.find((m) => m.id === id)
                    if (!memory) return null

                    return (
                      <div key={id} className="flex items-center justify-between p-2 rounded-md bg-accent/50">
                        <span className="font-medium truncate">{memory.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleMemory(id)}
                          className="h-7 w-7 p-0"
                        >
                          ✕
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push(`/albums/${params.id}`)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Memories</CardTitle>
              <CardDescription>Choose memories to include in this album</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search memories..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredMemories.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No memories found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto p-1">
                  {filteredMemories.map((memory) => (
                    <div
                      key={memory.id}
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedMemories.includes(memory.id)
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => handleToggleMemory(memory.id)}
                    >
                      <div className="aspect-video relative bg-muted">
                        {memory.mediaUrl && (memory.type === "photo" || memory.type === "video") ? (
                          <img
                            src={memory.mediaUrl || "/placeholder.svg"}
                            alt={memory.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Image className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Checkbox
                            checked={selectedMemories.includes(memory.id)}
                            className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium truncate">{memory.title}</h3>
                        <p className="text-xs text-muted-foreground">{format(new Date(memory.date), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

