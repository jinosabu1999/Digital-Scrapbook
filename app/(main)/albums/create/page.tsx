"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useMemories } from "@/context/memory-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'
import dynamic from "next/dynamic"
import { Suspense } from "react"
import type React from "react"
import AlbumCreateContent from "./album-create-content"

function AlbumCreateLoading() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </CardContent>
    </Card>
  )
}

export default function Page(): React.ReactElement {
  const router = useRouter()
  const { toast } = useToast()
  const { memories, addAlbum, loading } = useMemories()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Wait for context to load
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsLoaded(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loading])

  const handleMemoryToggle = (memoryId: string) => {
    setSelectedMemories((prev) =>
      prev.includes(memoryId) ? prev.filter((id) => id !== memoryId) : [...prev, memoryId],
    )
  }

  const handleSelectAll = () => {
    setSelectedMemories(memories.map((m) => m.id))
  }

  const handleDeselectAll = () => {
    setSelectedMemories([])
  }

  const handleCreateAlbum = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your album",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Get cover image from first selected memory with media
      const coverMemory = memories.find(
        (m) => selectedMemories.includes(m.id) && m.mediaUrl && (m.type === "photo" || m.type === "video"),
      )

      const albumId = addAlbum({
        title: title.trim(),
        description: description.trim() || undefined,
        coverUrl: coverMemory?.mediaUrl,
        memories: selectedMemories,
      })

      toast({
        title: "Album Created!",
        description: `Successfully created album "${title}" with ${selectedMemories.length} memories`,
      })

      router.push(`/albums/${albumId}`)
    } catch (error) {
      console.error("Error creating album:", error)
      toast({
        title: "Error",
        description: "Failed to create album. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Album</h1>
          <p className="text-muted-foreground">Organize your memories into beautiful albums</p>
        </div>

        <Suspense fallback={<AlbumCreateLoading />}>
          <AlbumCreateContent
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            selectedMemories={selectedMemories}
            setSelectedMemories={setSelectedMemories}
            handleMemoryToggle={handleMemoryToggle}
            handleSelectAll={handleSelectAll}
            handleDeselectAll={handleDeselectAll}
            handleCreateAlbum={handleCreateAlbum}
            isCreating={isCreating}
            isLoaded={isLoaded}
          />
        </Suspense>
      </div>
    </div>
  )
}
