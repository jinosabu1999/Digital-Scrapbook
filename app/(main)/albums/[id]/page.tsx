"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Edit,
  Trash,
  Share,
  Grid,
  List,
  ImageIcon,
  Video,
  Mic,
  FileText,
  Loader2,
  FolderHeart,
  Calendar,
  MapPin,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/empty-state"

export default function AlbumDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { getAlbum, getMemory, updateAlbum, deleteAlbum, removeMemoryFromAlbum, loading } = useMemories()

  const [album, setAlbum] = useState(getAlbum(params.id))
  const [view, setView] = useState<"grid" | "list">("grid")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(album?.title || "")
  const [editDescription, setEditDescription] = useState(album?.description || "")

  useEffect(() => {
    // Update album if it changes in context
    setAlbum(getAlbum(params.id))
  }, [getAlbum, params.id])

  useEffect(() => {
    if (album) {
      setEditTitle(album.title)
      setEditDescription(album.description || "")
    }
  }, [album])

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
        description="The album you're looking for doesn't exist or has been deleted."
        action={
          <Button asChild>
            <Link href="/albums">Back to Albums</Link>
          </Button>
        }
      />
    )
  }

  const albumMemories = album.memories.map((id) => getMemory(id)).filter((memory) => memory !== undefined) as any[]

  const handleDeleteAlbum = async () => {
    setIsDeleting(true)
    try {
      deleteAlbum(params.id)
      toast({
        title: "Album deleted",
        description: "Your album has been deleted successfully.",
      })
      router.push("/albums")
    } catch (error) {
      console.error("Error deleting album:", error)
      toast({
        title: "Error",
        description: "Failed to delete album. Please try again.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  const handleUpdateAlbum = () => {
    if (!editTitle.trim()) {
      toast({
        title: "Error",
        description: "Album title is required.",
        variant: "destructive",
      })
      return
    }

    updateAlbum(params.id, {
      title: editTitle,
      description: editDescription || undefined,
    })

    toast({
      title: "Album updated",
      description: "Your album has been updated successfully.",
    })

    setIsEditing(false)
  }

  const handleRemoveMemory = (memoryId: string) => {
    removeMemoryFromAlbum(memoryId, params.id)
    toast({
      title: "Memory removed",
      description: "The memory has been removed from this album.",
    })
  }

  const handleShare = async () => {
    try {
      // Check if the Web Share API is available
      if (navigator.share && window.isSecureContext) {
        try {
          await navigator.share({
            title: album.title,
            text: album.description || `Check out this album: ${album.title}`,
            url: window.location.href,
          })

          toast({
            title: "Shared successfully",
            description: "Your album has been shared.",
          })
        } catch (error) {
          console.error("Share API error:", error)

          // If user cancelled sharing, don't show an error
          if (error instanceof Error && error.name === "AbortError") {
            return
          }

          // Fallback to clipboard if sharing fails for other reasons
          fallbackToClipboard()
        }
      } else {
        // Fallback for browsers without Web Share API
        fallbackToClipboard()
      }
    } catch (error) {
      console.error("Error in share function:", error)
      toast({
        title: "Share failed",
        description: "Failed to share the album. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fallbackToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Album link has been copied to clipboard.",
      })
    } catch (clipboardError) {
      console.error("Clipboard error:", clipboardError)
      toast({
        title: "Share failed",
        description: "Could not copy link to clipboard. Please copy the URL manually.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{album.title}</h1>
          {album.description && <p className="text-muted-foreground mt-1">{album.description}</p>}
          <p className="text-sm text-muted-foreground mt-1">
            {albumMemories.length} {albumMemories.length === 1 ? "memory" : "memories"} • Created{" "}
            {format(new Date(album.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Edit className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Album</DialogTitle>
                <DialogDescription>Update the details of your album.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input id="title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateAlbum}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share className="h-5 w-5" />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash className="h-5 w-5" />}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Album</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this album? This action cannot be undone. The memories in this album
                  will not be deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAlbum} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Album"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "list")} className="w-auto">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button asChild>
          <Link href={`/albums/${params.id}/edit`}>Add Memories</Link>
        </Button>
      </div>

      {albumMemories.length === 0 ? (
        <EmptyState
          title="No memories in this album"
          description="Add memories to this album to see them here"
          icon={<FolderHeart className="h-12 w-12 text-muted-foreground" />}
          action={
            <Button asChild>
              <Link href={`/albums/${params.id}/edit`}>Add Memories</Link>
            </Button>
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {albumMemories.map((memory) => (
            <Card key={memory.id} className="overflow-hidden group">
              <Link href={`/memory/${memory.id}`}>
                <div className="aspect-square relative bg-muted">
                  {memory.mediaUrl && (memory.type === "photo" || memory.type === "video") ? (
                    <img
                      src={memory.mediaUrl || "/placeholder.svg"}
                      alt={memory.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      {memory.type === "audio" && <Mic className="h-12 w-12 text-muted-foreground" />}
                      {memory.type === "text" && <FileText className="h-12 w-12 text-muted-foreground" />}
                      {memory.type === "photo" && <ImageIcon className="h-12 w-12 text-muted-foreground" />}
                      {memory.type === "video" && <Video className="h-12 w-12 text-muted-foreground" />}
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemoveMemory(memory.id)
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </Link>
              <CardContent className="p-3">
                <h3 className="font-medium truncate">{memory.title}</h3>
                <p className="text-xs text-muted-foreground">{format(new Date(memory.date), "MMM d, yyyy")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {albumMemories.map((memory) => (
            <Card key={memory.id} className="overflow-hidden">
              <CardContent className="p-0">
                <Link href={`/memory/${memory.id}`}>
                  <div className="flex items-start p-4">
                    <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                      {memory.mediaUrl && (memory.type === "photo" || memory.type === "video") ? (
                        <img
                          src={memory.mediaUrl || "/placeholder.svg"}
                          alt={memory.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          {memory.type === "audio" && <Mic className="h-6 w-6 text-muted-foreground" />}
                          {memory.type === "text" && <FileText className="h-6 w-6 text-muted-foreground" />}
                          {memory.type === "photo" && <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                          {memory.type === "video" && <Video className="h-6 w-6 text-muted-foreground" />}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium">{memory.title}</h3>
                      <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-3 mt-1">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>{format(new Date(memory.date), "MMM d, yyyy")}</span>
                        </div>
                        {memory.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span>{memory.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 ml-2"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleRemoveMemory(memory.id)
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
