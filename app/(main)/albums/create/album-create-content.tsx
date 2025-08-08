"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useMemories } from "@/context/memory-context"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, Loader2, Image, Video, Mic, FileText } from 'lucide-react'
import { format } from "date-fns"
import { getFileDataUrl } from "@/lib/file-utils"

export default function AlbumCreateContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { memories, addAlbum } = useMemories()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file for the cover",
        variant: "destructive",
      })
      return
    }

    try {
      const dataUrl = await getFileDataUrl(file)
      setCoverImage(dataUrl)
    } catch (error) {
      console.error("Error processing cover image:", error)
      toast({
        title: "Error",
        description: "Failed to process cover image",
        variant: "destructive",
      })
    }
  }

  const handleMemoryToggle = (memoryId: string) => {
    setSelectedMemories(prev => 
      prev.includes(memoryId) 
        ? prev.filter(id => id !== memoryId)
        : [...prev, memoryId]
    )
  }

  const handleCreate = async () => {
    const missingFields: string[] = []

    if (!title.trim()) {
      missingFields.push("Album title")
    }

    if (selectedMemories.length === 0) {
      missingFields.push("At least one memory")
    }

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Information",
        description: `Please provide: ${missingFields.join(", ")}`,
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    setIsCreating(true)

    try {
      const albumId = addAlbum({
        title,
        description: description || undefined,
        coverUrl: coverImage || undefined,
        memories: selectedMemories,
      })

      toast({
        title: "Album Created Successfully! 🎉",
        description: `"${title}" has been added to your collection`,
        duration: 3000,
      })

      router.push(`/albums/${albumId}`)
    } catch (error) {
      console.error("Error creating album:", error)
      toast({
        title: "Creation Failed",
        description: "Something went wrong while creating your album. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Create New Album</h1>
          <p className="text-muted-foreground mt-1">
            Organize your memories into a beautiful album
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Album Details</CardTitle>
            <CardDescription>
              Give your album a name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Album Title *</Label>
              <Input
                id="title"
                placeholder="Enter album title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={!title.trim() ? "border-red-300 focus:border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your album"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image (Optional)</Label>
              <div className="flex items-center gap-4">
                {coverImage ? (
                  <div className="relative">
                    <img
                      src={coverImage || "/placeholder.svg"}
                      alt="Cover preview"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => setCoverImage(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {coverImage ? "Change Cover" : "Upload Cover"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG up to 5MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverImageChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Memories</CardTitle>
            <CardDescription>
              Choose which memories to include in this album ({selectedMemories.length} selected)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {memories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No memories available. Create some memories first!</p>
                <Button asChild className="mt-4">
                  <a href="/upload">Add Memory</a>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className={`relative border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedMemories.includes(memory.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleMemoryToggle(memory.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedMemories.includes(memory.id)}
                        onChange={() => handleMemoryToggle(memory.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {memory.type === "photo" && <Image className="h-4 w-4 text-muted-foreground" />}
                          {memory.type === "video" && <Video className="h-4 w-4 text-muted-foreground" />}
                          {memory.type === "audio" && <Mic className="h-4 w-4 text-muted-foreground" />}
                          {memory.type === "text" && <FileText className="h-4 w-4 text-muted-foreground" />}
                          <h4 className="font-medium text-sm truncate">{memory.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(memory.date), "MMM d, yyyy")}
                        </p>
                        {memory.mediaUrl && (memory.type === "photo" || memory.type === "video") && (
                          <div className="mt-2">
                            <img
                              src={memory.mediaUrl || "/placeholder.svg"}
                              alt={memory.title}
                              className="w-full h-16 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Album"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
