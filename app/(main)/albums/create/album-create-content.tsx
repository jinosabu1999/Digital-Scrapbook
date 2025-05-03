"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, FolderHeart, Search, Image, Plus, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"
import Link from "next/link"

export default function AlbumCreateContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { memories, addAlbum } = useMemories()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Ensure memories are loaded
  useEffect(() => {
    // Set a small timeout to ensure context is fully loaded
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Filter memories based on search query
  const filteredMemories = memories.filter(
    (memory) =>
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (memory.location && memory.location.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleToggleMemory = (memoryId: string) => {
    setSelectedMemories((prev) =>
      prev.includes(memoryId) ? prev.filter((id) => id !== memoryId) : [...prev, memoryId],
    )
  }

  const handleSave = async () => {
    setError(null)

    // Validate required fields
    if (!title.trim()) {
      setError("Album title is required")
      return
    }

    // Allow empty albums now
    setIsSaving(true)

    try {
      // Add the album to our context
      const albumId = addAlbum({
        title,
        description: description || undefined,
        memories: selectedMemories,
      })

      toast({
        title: "Success!",
        description: "Album created successfully!",
        variant: "success",
      })

      // Redirect to the album detail page
      router.push(`/albums/${albumId}`)
    } catch (err) {
      console.error("Error creating album:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Create New Album</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Album Details</CardTitle>
              <CardDescription>Fill in the details about your album</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Give your album a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Add a description for your album"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/albums")} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Album"
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Memories</CardTitle>
              <CardDescription>
                {selectedMemories.length} {selectedMemories.length === 1 ? "memory" : "memories"} selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedMemories.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <FolderHeart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p>No memories selected yet</p>
                  <p className="text-sm">You can create an empty album and add memories later</p>
                </div>
              ) : (
                <div className="space-y-2">
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
          </Card>
        </div>

        <div className="md:col-span-2">
          {!isLoaded ? (
            <Card>
              <CardHeader>
                <CardTitle>Loading memories...</CardTitle>
                <CardDescription>Please wait while we load your memories</CardDescription>
              </CardHeader>
              <CardContent className="py-6 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : memories.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Memories Available</CardTitle>
                <CardDescription>Add memories to include in your album</CardDescription>
              </CardHeader>
              <CardContent className="py-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No memories found</AlertTitle>
                  <AlertDescription>
                    You don't have any memories yet. You can create an empty album now and add memories later, or add
                    some memories first.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-center mt-6">
                  <Button asChild>
                    <Link href="/upload">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Memory
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select Memories</CardTitle>
                <CardDescription>Choose memories to include in this album</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search memories..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

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
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(memory.date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

