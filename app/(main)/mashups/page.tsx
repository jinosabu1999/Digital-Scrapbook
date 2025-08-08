"use client"

import { useState, useRef } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Play, Download, Share, Plus, Loader2, Image, Video, Mic, Music, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function MashupsPage() {
  const { memories, loading } = useMemories()
  const { toast } = useToast()
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [mashupTitle, setMashupTitle] = useState("My Memory Mashup")
  const [theme, setTheme] = useState("modern")
  const [duration, setDuration] = useState([60])
  const [isCreating, setIsCreating] = useState(false)
  const [mashupPreview, setMashupPreview] = useState<string | null>(null)
  const [mediaFilter, setMediaFilter] = useState("all")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Filter to media memories
  const mediaMemories = memories.filter(
    (memory) => (memory.type === "photo" || memory.type === "video" || memory.type === "audio") && memory.mediaUrl,
  )

  // Apply additional filter based on tab selection
  const filteredMemories =
    mediaFilter === "all" ? mediaMemories : mediaMemories.filter((memory) => memory.type === mediaFilter)

  const handleToggleMemory = (id: string) => {
    setSelectedMemories((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  const createMashupPreview = async () => {
    if (selectedMemories.length < 3 || !canvasRef.current) return null

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      // Set canvas size
      canvas.width = 800
      canvas.height = 450

      // Fill background based on theme
      let bgColor = "#ffffff"
      switch (theme) {
        case "vintage":
          bgColor = "#f5e8c0"
          break
        case "minimal":
          bgColor = "#f0f0f0"
          break
        case "bold":
          bgColor = "#2a2a2a"
          break
        default:
          bgColor = "#ffffff"
      }

      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw title
      ctx.fillStyle = theme === "bold" ? "#ffffff" : "#333333"
      ctx.font = "bold 28px Arial"
      ctx.textAlign = "center"
      ctx.fillText(mashupTitle, canvas.width / 2, 50)

      // Draw duration
      ctx.fillStyle = theme === "bold" ? "#cccccc" : "#666666"
      ctx.font = "16px Arial"
      ctx.fillText(`Duration: ${duration[0]} seconds`, canvas.width / 2, 80)

      // Load selected images
      const selectedItems = []
      for (const id of selectedMemories.slice(0, 6)) {
        const memory = memories.find((m) => m.id === id)
        if (!memory || !memory.mediaUrl) continue

        if (memory.type === "photo" || memory.type === "video") {
          try {
            const img = document.createElement("img")
            img.crossOrigin = "anonymous"

            // Use a promise to wait for the image to load
            await new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = reject
              img.src = memory.mediaUrl || ""
            })

            selectedItems.push({ img, type: memory.type })
          } catch (error) {
            console.error("Error loading image:", error)
            continue
          }
        }
      }

      // Draw a filmstrip-like layout
      if (selectedItems.length > 0) {
        const frameWidth = 120
        const frameHeight = 90
        const frameSpacing = 10
        const startY = 120

        // Draw frames
        selectedItems.forEach((item, i) => {
          const row = Math.floor(i / 3)
          const col = i % 3
          const x = 100 + col * (frameWidth + frameSpacing)
          const y = startY + row * (frameHeight + frameSpacing)

          // Draw frame
          ctx.fillStyle = "#000000"
          ctx.fillRect(x - 2, y - 2, frameWidth + 4, frameHeight + 4)

          // Draw image
          ctx.drawImage(item.img, x, y, frameWidth, frameHeight)

          // Draw icon for video
          if (item.type === "video") {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
            ctx.beginPath()
            ctx.moveTo(x + 10, y + 10)
            ctx.lineTo(x + 10, y + 25)
            ctx.lineTo(x + 25, y + 17.5)
            ctx.closePath()
            ctx.fill()
          }
        })

        // Draw timeline
        const timelineY = 350
        ctx.fillStyle = theme === "bold" ? "#555555" : "#dddddd"
        ctx.fillRect(100, timelineY, 600, 10)

        // Draw playhead
        ctx.fillStyle = "#ff0000"
        ctx.beginPath()
        ctx.moveTo(400, timelineY - 5)
        ctx.lineTo(410, timelineY - 5)
        ctx.lineTo(405, timelineY + 15)
        ctx.closePath()
        ctx.fill()

        // Draw play button
        ctx.fillStyle = theme === "bold" ? "#ffffff" : "#333333"
        ctx.beginPath()
        ctx.arc(canvas.width / 2, 300, 30, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = theme === "bold" ? "#333333" : "#ffffff"
        ctx.beginPath()
        ctx.moveTo(canvas.width / 2 - 10, 290)
        ctx.lineTo(canvas.width / 2 - 10, 310)
        ctx.lineTo(canvas.width / 2 + 15, 300)
        ctx.closePath()
        ctx.fill()
      }

      // Draw theme name
      ctx.fillStyle = theme === "bold" ? "#ffffff" : "#333333"
      ctx.font = "16px Arial"
      ctx.textAlign = "right"
      ctx.fillText(`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`, canvas.width - 50, canvas.height - 20)

      return canvas.toDataURL("image/png")
    } catch (error) {
      console.error("Error creating mashup:", error)
      return null
    }
  }

  const handleCreateMashup = async () => {
    if (selectedMemories.length < 3) {
      toast({
        title: "Not enough media",
        description: "Please select at least 3 items for your mashup.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Create actual mashup preview
      const mashupDataUrl = await createMashupPreview()

      if (mashupDataUrl) {
        setMashupPreview(mashupDataUrl)

        toast({
          title: "Mashup created!",
          description: "Your memory mashup has been created successfully.",
          variant: "success",
        })
      } else {
        throw new Error("Failed to create mashup preview")
      }
    } catch (error) {
      console.error("Error creating mashup:", error)
      toast({
        title: "Error",
        description: "Failed to create mashup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDownload = () => {
    if (!mashupPreview) return

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = mashupPreview
    link.download = `${mashupTitle.replace(/\s+/g, "-").toLowerCase()}.png`
    document.body.appendChild(link)

    // Trigger download
    link.click()

    // Clean up
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "Your mashup is being downloaded.",
      variant: "success",
    })
  }

  const handleShare = () => {
    toast({
      title: "Share",
      description: "Sharing functionality will be available soon.",
    })
  }

  const getMemoryTypeIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Image className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Mic className="h-4 w-4" />
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

  if (mediaMemories.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Memory Mashups</h1>
        <EmptyState
          title="No media found"
          description="Add some photos, videos, or audio to create mashups"
          action={
            <Button asChild>
              <Link href="/upload">
                <Plus className="h-4 w-4 mr-2" />
                Add Media
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Memory Mashups</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Requirements</AlertTitle>
        <AlertDescription>
          To create a mashup, you need to select at least 3 media items (photos, videos, or audio). Mashups combine
          different types of media into a dynamic presentation.
        </AlertDescription>
      </Alert>

      {/* Hidden canvas for generating mashup preview */}
      <canvas ref={canvasRef} style={{ display: "none" }} width="800" height="450"></canvas>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mashup Settings</CardTitle>
              <CardDescription>Customize your multimedia presentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={mashupTitle} onChange={(e) => setMashupTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={theme === "modern" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setTheme("modern")}
                  >
                    Modern
                  </Button>
                  <Button
                    variant={theme === "vintage" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setTheme("vintage")}
                  >
                    Vintage
                  </Button>
                  <Button
                    variant={theme === "minimal" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setTheme("minimal")}
                  >
                    Minimal
                  </Button>
                  <Button
                    variant={theme === "bold" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setTheme("bold")}
                  >
                    Bold
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Music</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue placeholder="Select music" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="acoustic">Acoustic</SelectItem>
                    <SelectItem value="upbeat">Upbeat</SelectItem>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Duration (seconds)</Label>
                  <span className="text-sm text-muted-foreground">{duration[0]}s</span>
                </div>
                <Slider defaultValue={duration} max={180} min={15} step={5} onValueChange={setDuration} />
              </div>

              <Button
                className="w-full"
                onClick={handleCreateMashup}
                disabled={selectedMemories.length < 3 || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Mashup"
                )}
              </Button>
            </CardContent>
          </Card>

          {mashupPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="icon" className="h-12 w-12 rounded-full">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                  <img
                    src={mashupPreview || "/placeholder.svg"}
                    alt="Mashup Preview"
                    className="w-full h-full object-contain opacity-80"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Media</CardTitle>
              <CardDescription>
                {selectedMemories.length} of {mediaMemories.length} items selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={mediaFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMediaFilter("all")}
                >
                  All Media
                </Button>
                <Button
                  variant={mediaFilter === "photo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMediaFilter("photo")}
                  className="flex items-center gap-1"
                >
                  <Image className="h-4 w-4" />
                  Photos
                </Button>
                <Button
                  variant={mediaFilter === "video" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMediaFilter("video")}
                  className="flex items-center gap-1"
                >
                  <Video className="h-4 w-4" />
                  Videos
                </Button>
                <Button
                  variant={mediaFilter === "audio" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMediaFilter("audio")}
                  className="flex items-center gap-1"
                >
                  <Mic className="h-4 w-4" />
                  Audio
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto p-1">
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
                    <div className="aspect-square relative bg-muted">
                      {memory.type === "photo" || memory.type === "video" ? (
                        <img
                          src={memory.mediaUrl || "/placeholder.svg"}
                          alt={memory.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Music className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {memory.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Checkbox
                          checked={selectedMemories.includes(memory.id)}
                          className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <div className="bg-black/60 text-white p-1 rounded-md">{getMemoryTypeIcon(memory.type)}</div>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{memory.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
