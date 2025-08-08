"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash2, Download, Calendar, MapPin, Tag, Clock, Loader2, ImageIcon, Video, Mic, FileText } from 'lucide-react'
import { format } from "date-fns"
import Link from "next/link"
import { EmptyState } from "@/components/empty-state"
import { MoodBadge } from "@/components/mood-selector"
import { FavoriteButton } from "@/components/favorite-button"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MemoryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { getMemory, deleteMemory, loading } = useMemories()
  const [memory, setMemory] = useState(getMemory(params.id))
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentMemory = getMemory(params.id)
    setMemory(currentMemory)
  }, [getMemory, params.id])

  const handleDelete = async () => {
    if (!memory) return
    
    setIsDeleting(true)
    try {
      deleteMemory(memory.id)
      toast({
        title: "Memory Deleted",
        description: "The memory has been permanently deleted.",
      })
      router.push("/memories")
    } catch (error) {
      console.error("Error deleting memory:", error)
      toast({
        title: "Error",
        description: "Failed to delete memory. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = () => {
    if (!memory?.mediaUrl) {
      toast({
        title: "Download Failed",
        description: "No media found to download.",
        variant: "destructive",
      })
      return
    }
    
    // For Base64 data URLs, create a blob and then a download link
    const link = document.createElement('a')
    link.href = memory.mediaUrl
    
    // Determine file extension based on type
    let fileExtension = 'bin'
    if (memory.type === 'photo') fileExtension = 'png' // Assuming most photos are png/jpg
    else if (memory.type === 'video') fileExtension = 'mp4'
    else if (memory.type === 'audio') fileExtension = 'mp3'

    link.download = `${memory.title || 'memory'}.${fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Download Started",
      description: "Your memory is being downloaded.",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading memory...</p>
        </div>
      </div>
    )
  }

  if (!memory) {
    return (
      <EmptyState
        title="Memory not found"
        description="The memory you're looking for doesn't exist or has been deleted."
        action={
          <Button asChild>
            <Link href="/memories">Back to Memories</Link>
          </Button>
        }
      />
    )
  }

  // Check if time capsule is locked
  const isTimeCapsuleLocked = memory.isTimeCapsule && memory.unlockDate && new Date() < new Date(memory.unlockDate)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/upload">
                Add Memory
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Action Bar - Mobile Responsive */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {memory.mediaUrl && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          )}
          
          <Button variant="outline" size="sm" asChild>
            <Link href={`/memory/${memory.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
          </Button>

          <FavoriteButton
            memoryId={memory.id}
            isLiked={memory.isLiked}
            size="sm"
            variant="outline"
          />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Memory</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{memory.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {isTimeCapsuleLocked ? (
            <Card className="border-2 border-dashed border-primary/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-2">Time Capsule Locked</h2>
                <p className="text-muted-foreground mb-4">
                  This memory will unlock on {format(new Date(memory.unlockDate!), "MMMM d, yyyy")}
                </p>
                <div className="space-y-2">
                  <h3 className="font-medium">{memory.title}</h3>
                  {memory.description && (
                    <p className="text-sm text-muted-foreground">{memory.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Title and Mood */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {memory.type === "photo" && <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                      {memory.type === "video" && <Video className="h-5 w-5 text-muted-foreground" />}
                      {memory.type === "audio" && <Mic className="h-5 w-5 text-muted-foreground" />}
                      {memory.type === "text" && <FileText className="h-5 w-5 text-muted-foreground" />}
                      <h1 className="text-2xl sm:text-3xl font-bold">{memory.title}</h1>
                    </div>
                    {memory.description && (
                      <p className="text-muted-foreground text-lg">{memory.description}</p>
                    )}
                  </div>
                  {memory.mood && (
                    <div className="flex-shrink-0">
                      <MoodBadge mood={memory.mood} />
                    </div>
                  )}
                </div>
              </div>

              {/* Media Content */}
              {memory.mediaUrl && (
                <Card>
                  <CardContent className="p-0">
                    <div className="relative">
                      {memory.type === "photo" && (
                        <img
                          src={memory.mediaUrl || "/placeholder.svg"}
                          alt={memory.title}
                          className="w-full max-h-[70vh] object-contain rounded-lg"
                        />
                      )}
                      {memory.type === "video" && (
                        <video
                          src={memory.mediaUrl}
                          controls
                          className="w-full max-h-[70vh] rounded-lg"
                        />
                      )}
                      {memory.type === "audio" && (
                        <div className="p-8 bg-muted rounded-lg">
                          <audio src={memory.mediaUrl} controls className="w-full" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Text Content */}
              {memory.type === "text" && memory.content && (
                <Card>
                  <CardContent className="p-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{memory.content}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Memory Details */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(memory.date), "EEEE, MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {memory.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{memory.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {memory.tags && memory.tags.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {memory.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {memory.isTimeCapsule && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Time Capsule</p>
                          <p className="text-sm text-muted-foreground">
                            {memory.unlockDate 
                              ? `Unlocks on ${format(new Date(memory.unlockDate), "MMMM d, yyyy")}`
                              : "Time capsule memory"
                            }
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
