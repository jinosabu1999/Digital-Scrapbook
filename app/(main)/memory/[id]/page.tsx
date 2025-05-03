"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Heart,
  Share,
  Edit,
  Trash,
  Download,
  MapPin,
  Calendar,
  ImageIcon,
  Crop,
  Loader2,
  Video,
  Mic,
  FileText,
  Copy,
  Check,
  Facebook,
  Mail,
  QrCode,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/empty-state"
import { downloadFile, applyImageFilter, cropImage } from "@/lib/download-utils"

export default function MemoryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { getMemory, deleteMemory, toggleLike, updateMemory, applyFilter, loading } = useMemories()
  const [memory, setMemory] = useState(getMemory(params.id))
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(memory?.appliedFilter || null)
  const [selectedCropRatio, setSelectedCropRatio] = useState<string>("1:1")
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })

  // Sharing states
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [isPublic, setIsPublic] = useState(memory?.isPublic || false)
  const [isCopied, setIsCopied] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // Update memory if it changes in context
    const updatedMemory = getMemory(params.id)
    if (updatedMemory) {
      setMemory(updatedMemory)
      setIsPublic(updatedMemory.isPublic || false)
    }
  }, [getMemory, params.id])

  // Generate share URL when dialog opens
  useEffect(() => {
    if (shareDialogOpen && memory) {
      // In a real app, this would be a proper sharing URL
      // For now, we'll use the current URL
      setShareUrl(window.location.href)
    }
  }, [shareDialogOpen, memory])

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this memory? This action cannot be undone.")) {
      setIsDeleting(true)
      try {
        deleteMemory(params.id)
        toast({
          title: "Memory deleted",
          description: "Your memory has been deleted successfully.",
        })
        router.push("/memories")
      } catch (error) {
        console.error("Error deleting memory:", error)
        toast({
          title: "Error",
          description: "Failed to delete memory. Please try again.",
          variant: "destructive",
        })
        setIsDeleting(false)
      }
    }
  }

  const handleLike = () => {
    if (memory) {
      toggleLike(memory.id)
      toast({
        title: memory.isLiked ? "Removed from favorites" : "Added to favorites",
        description: memory.isLiked
          ? "This memory has been removed from your favorites."
          : "This memory has been added to your favorites.",
      })
    }
  }

  const handleDownload = async () => {
    if (!memory) return

    setIsDownloading(true)
    try {
      let url = memory.mediaUrl
      let filename = `${memory.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`

      if (memory.type === "photo") {
        filename += ".jpg"
      } else if (memory.type === "video") {
        filename += ".mp4"
      } else if (memory.type === "audio") {
        filename += ".mp3"
      } else if (memory.type === "text") {
        // For text memories, create a text file
        const blob = new Blob([memory.content || ""], { type: "text/plain" })
        url = URL.createObjectURL(blob)
        filename += ".txt"
      }

      if (url) {
        const success = await downloadFile(url, filename)
        if (success) {
          toast({
            title: "Download complete",
            description: `${memory.title} has been downloaded successfully.`,
          })
        } else {
          throw new Error("Download failed")
        }
      } else {
        throw new Error("No media to download")
      }
    } catch (error) {
      console.error("Error downloading memory:", error)
      toast({
        title: "Download failed",
        description: "Failed to download the memory. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleApplyFilter = async () => {
    if (!memory || memory.type !== "photo" || !memory.mediaUrl || !imageRef.current) return

    try {
      // Apply the selected filter
      if (selectedFilter) {
        const filteredImageUrl = applyImageFilter(imageRef.current, selectedFilter)

        // Update the memory with the filtered image
        updateMemory(memory.id, {
          mediaUrl: filteredImageUrl,
          appliedFilter: selectedFilter,
        })

        toast({
          title: "Filter applied",
          description: `The ${selectedFilter} filter has been applied to your memory.`,
        })
      } else {
        toast({
          title: "No filter selected",
          description: "Please select a filter to apply.",
        })
      }
    } catch (error) {
      console.error("Error applying filter:", error)
      toast({
        title: "Error",
        description: "Failed to apply filter. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleApplyCrop = async () => {
    if (!memory || memory.type !== "photo" || !memory.mediaUrl || !imageRef.current) return

    try {
      // Apply the selected crop
      const [ratioWidth, ratioHeight] = selectedCropRatio.split(":").map(Number)
      const croppedImageUrl = cropImage(imageRef.current, selectedCropRatio, cropPosition.x, cropPosition.y)

      // Update the memory with the cropped image
      updateMemory(memory.id, {
        mediaUrl: croppedImageUrl,
      })

      toast({
        title: "Crop applied",
        description: `Your memory has been cropped to ${selectedCropRatio} ratio.`,
      })
    } catch (error) {
      console.error("Error applying crop:", error)
      toast({
        title: "Error",
        description: "Failed to crop image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = () => {
    setShareDialogOpen(true)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)

      toast({
        title: "Link copied",
        description: "Memory link has been copied to clipboard.",
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleTogglePublic = () => {
    if (!memory) return

    setIsPublic(!isPublic)
    updateMemory(memory.id, {
      isPublic: !isPublic,
    })

    toast({
      title: isPublic ? "Memory set to private" : "Memory set to public",
      description: isPublic
        ? "This memory is now private and can only be viewed by you."
        : "This memory is now public and can be viewed by anyone with the link.",
    })
  }

  const handleGenerateQRCode = async () => {
    if (!shareUrl) return

    setIsGeneratingQR(true)
    try {
      // In a real app, you would use a QR code generation service
      // For this example, we'll use a public API
      const encodedUrl = encodeURIComponent(shareUrl)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast({
        title: "QR Code Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const handleSocialShare = (platform: "facebook" | "twitter" | "instagram" | "email") => {
    if (!memory) return

    const title = memory.title
    const url = shareUrl

    let shareUrlToOpen = ""

    switch (platform) {
      case "facebook":
        shareUrlToOpen = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "twitter":
        shareUrlToOpen = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        break
      case "instagram":
        // Instagram doesn't have a direct web sharing API, so we'll show a toast with instructions
        toast({
          title: "Instagram Sharing",
          description: "Copy the link and paste it in your Instagram story or direct message.",
          duration: 5000,
        })
        navigator.clipboard.writeText(url)
        return
      case "email":
        shareUrlToOpen = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this memory: ${url}`)}`
        break
    }

    if (shareUrlToOpen) {
      window.open(shareUrlToOpen, "_blank")
    }
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

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      {/* Update the header section to be more responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{memory.title}</h1>
          <div className="flex flex-wrap items-center text-muted-foreground mt-1 gap-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(new Date(memory.date), "MMMM d, yyyy")}</span>
            </div>
            {memory.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{memory.location}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleLike}
            aria-label={memory.isLiked ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-5 w-5 ${memory.isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share memory">
            <Share className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" asChild aria-label="Edit memory">
            <Link href={`/memory/${params.id}/edit`}>
              <Edit className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label="Download memory"
          >
            {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete memory"
          >
            {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Update the grid layout to be more responsive */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0 relative">
              {memory.type === "photo" && memory.mediaUrl ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="cursor-zoom-in">
                      <img
                        ref={imageRef}
                        src={memory.mediaUrl || "/placeholder.svg"}
                        alt={memory.title}
                        className={`w-full rounded-md ${memory.appliedFilter ? `filter-${memory.appliedFilter}` : ""}`}
                        crossOrigin="anonymous"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <img
                      src={memory.mediaUrl || "/placeholder.svg"}
                      alt={memory.title}
                      className={`w-full rounded-md ${memory.appliedFilter ? `filter-${memory.appliedFilter}` : ""}`}
                      crossOrigin="anonymous"
                    />
                  </DialogContent>
                </Dialog>
              ) : memory.type === "video" && memory.mediaUrl ? (
                <video src={memory.mediaUrl} controls className="w-full rounded-md" />
              ) : memory.type === "audio" && memory.mediaUrl ? (
                <div className="p-6">
                  <audio src={memory.mediaUrl} controls className="w-full" />
                </div>
              ) : memory.type === "text" ? (
                <div className="p-6">
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">{memory.content}</div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No media available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {memory.description && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{memory.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {(memory.type === "photo" || memory.type === "video") && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Edit & Enhance</h3>
                <Tabs defaultValue="filters">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="filters">Filters</TabsTrigger>
                    <TabsTrigger value="crop">Crop</TabsTrigger>
                  </TabsList>
                  <TabsContent value="filters" className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div
                        className={`aspect-square rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary ${selectedFilter === null ? "ring-2 ring-primary" : ""}`}
                        onClick={() => setSelectedFilter(null)}
                      >
                        {memory.mediaUrl ? (
                          <img
                            src={memory.mediaUrl || "/placeholder.svg"}
                            alt="Original"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <p className="text-xs text-center mt-1">Original</p>
                      </div>
                      {memory.mediaUrl && memory.type === "photo" && (
                        <>
                          <div
                            className={`aspect-square rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary ${selectedFilter === "sepia" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setSelectedFilter("sepia")}
                          >
                            <img
                              src={memory.mediaUrl || "/placeholder.svg"}
                              alt="Vintage"
                              className="h-full w-full object-cover sepia"
                            />
                            <p className="text-xs text-center mt-1">Vintage</p>
                          </div>
                          <div
                            className={`aspect-square rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary ${selectedFilter === "grayscale" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setSelectedFilter("grayscale")}
                          >
                            <img
                              src={memory.mediaUrl || "/placeholder.svg"}
                              alt="B&W"
                              className="h-full w-full object-cover grayscale"
                            />
                            <p className="text-xs text-center mt-1">B&W</p>
                          </div>
                          <div
                            className={`aspect-square rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary ${selectedFilter === "saturate" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setSelectedFilter("saturate")}
                          >
                            <img
                              src={memory.mediaUrl || "/placeholder.svg"}
                              alt="Vivid"
                              className="h-full w-full object-cover saturate-150"
                            />
                            <p className="text-xs text-center mt-1">Vivid</p>
                          </div>
                          <div
                            className={`aspect-square rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary ${selectedFilter === "contrast" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setSelectedFilter("contrast")}
                          >
                            <img
                              src={memory.mediaUrl || "/placeholder.svg"}
                              alt="Dramatic"
                              className="h-full w-full object-cover contrast-125"
                            />
                            <p className="text-xs text-center mt-1">Dramatic</p>
                          </div>
                          <div
                            className={`aspect-square rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary ${selectedFilter === "brightness" ? "ring-2 ring-primary" : ""}`}
                            onClick={() => setSelectedFilter("brightness")}
                          >
                            <img
                              src={memory.mediaUrl || "/placeholder.svg"}
                              alt="Soft"
                              className="h-full w-full object-cover brightness-110 contrast-75"
                            />
                            <p className="text-xs text-center mt-1">Soft</p>
                          </div>
                        </>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleApplyFilter}
                      disabled={memory.type !== "photo" || !memory.mediaUrl}
                    >
                      Apply Filter
                    </Button>
                  </TabsContent>
                  <TabsContent value="crop" className="space-y-4">
                    <div className="aspect-video rounded-md overflow-hidden border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                      {memory.mediaUrl && memory.type === "photo" ? (
                        <div className="relative w-full h-full">
                          <img
                            src={memory.mediaUrl || "/placeholder.svg"}
                            alt={memory.title}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className={`border-2 border-primary ${selectedCropRatio === "1:1" ? "aspect-square" : selectedCropRatio === "4:3" ? "aspect-[4/3]" : "aspect-[16/9]"} w-3/4 h-auto`}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Crop className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {memory.type !== "photo"
                              ? "Cropping is only available for photos"
                              : "No photo available for cropping"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant={selectedCropRatio === "1:1" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setSelectedCropRatio("1:1")}
                      >
                        1:1
                      </Button>
                      <Button
                        variant={selectedCropRatio === "4:3" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setSelectedCropRatio("4:3")}
                      >
                        4:3
                      </Button>
                      <Button
                        variant={selectedCropRatio === "16:9" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setSelectedCropRatio("16:9")}
                      >
                        16:9
                      </Button>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleApplyCrop}
                      disabled={memory.type !== "photo" || !memory.mediaUrl}
                    >
                      Apply Crop
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                  <div className="flex items-center mt-1">
                    {memory.type === "photo" && <ImageIcon className="h-4 w-4 mr-1" />}
                    {memory.type === "video" && <Video className="h-4 w-4 mr-1" />}
                    {memory.type === "audio" && <Mic className="h-4 w-4 mr-1" />}
                    {memory.type === "text" && <FileText className="h-4 w-4 mr-1" />}
                    <span>{memory.type.charAt(0).toUpperCase() + memory.type.slice(1)}</span>
                  </div>
                </div>
                {memory.isTimeCapsule && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Time Capsule</h4>
                    <p className="mt-1">
                      Unlocks on{" "}
                      {memory.unlockDate ? format(new Date(memory.unlockDate), "MMMM d, yyyy") : "Unknown date"}
                    </p>
                  </div>
                )}
                {memory.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {memory.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="cursor-pointer">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                  <p className="mt-1">{format(new Date(memory.createdAt), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Sharing</h4>
                  <p className="mt-1 flex items-center">
                    <span className={isPublic ? "text-green-500" : "text-yellow-500"}>
                      {isPublic ? "Public" : "Private"}
                    </span>
                    <Button variant="ghost" size="sm" className="ml-2" onClick={handleShare}>
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Memory</DialogTitle>
            <DialogDescription>Share this memory with others via link or social media</DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input id="link" value={shareUrl} readOnly className="w-full" />
            </div>
            <Button size="sm" className="px-3" onClick={handleCopyLink}>
              <span className="sr-only">Copy</span>
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Switch id="public-switch" checked={isPublic} onCheckedChange={handleTogglePublic} />
            <Label htmlFor="public-switch">Make this memory public</Label>
          </div>

          <div className="mt-6">
            <Label>Share on social media</Label>
            <div className="flex justify-center gap-4 mt-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSocialShare("facebook")}
                className="rounded-full"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSocialShare("twitter")}
                className="rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-black dark:text-white"
                >
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSocialShare("instagram")}
                className="rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-pink-600"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleSocialShare("email")} className="rounded-full">
                <Mail className="h-5 w-5 text-red-500" />
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Label>QR Code</Label>
            <div className="flex flex-col items-center justify-center mt-2">
              {qrCodeUrl ? (
                <div className="border p-2 rounded-md">
                  <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-32 h-32" />
                </div>
              ) : (
                <Button variant="outline" onClick={handleGenerateQRCode} disabled={isGeneratingQR} className="w-full">
                  {isGeneratingQR ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate QR Code
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-start">
            <DialogTrigger asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogTrigger>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

