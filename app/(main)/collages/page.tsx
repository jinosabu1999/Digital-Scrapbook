"use client"

import { useState, useRef } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Grid, Columns, Rows, LayoutGrid, Download, Share, Plus, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function CollagesPage() {
  const { memories, loading } = useMemories()
  const { toast } = useToast()
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [collageTitle, setCollageTitle] = useState("My Collage")
  const [layout, setLayout] = useState("grid")
  const [isCreating, setIsCreating] = useState(false)
  const [collagePreview, setCollagePreview] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Filter to only photo memories
  const photoMemories = memories.filter((memory) => memory.type === "photo" && memory.mediaUrl)

  const handleToggleMemory = (id: string) => {
    setSelectedMemories((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  const createCollageCanvas = async () => {
    if (selectedMemories.length < 2 || !canvasRef.current) return null

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      // Set canvas size
      canvas.width = 800
      canvas.height = 600

      // Fill background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw title
      ctx.fillStyle = "#333333"
      ctx.font = "bold 24px Arial"
      ctx.textAlign = "center"
      ctx.fillText(collageTitle, canvas.width / 2, 40)

      // Load selected images
      const selectedImages = []
      for (const id of selectedMemories) {
        const memory = memories.find((m) => m.id === id)
        if (!memory || !memory.mediaUrl) continue

        try {
          const img = document.createElement("img")
          img.crossOrigin = "anonymous"

          // Use a promise to wait for the image to load
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = memory.mediaUrl || ""
          })

          selectedImages.push(img)
        } catch (error) {
          console.error("Error loading image:", error)
          continue
        }
      }

      // Draw images based on layout
      if (layout === "grid") {
        const rows = Math.ceil(Math.sqrt(selectedImages.length))
        const cols = Math.ceil(selectedImages.length / rows)
        const imgWidth = (canvas.width - 40) / cols
        const imgHeight = (canvas.height - 80) / rows

        selectedImages.forEach((img, i) => {
          const row = Math.floor(i / cols)
          const col = i % cols
          const x = 20 + col * imgWidth
          const y = 60 + row * imgHeight
          ctx.drawImage(img, x, y, imgWidth - 10, imgHeight - 10)
        })
      } else if (layout === "columns") {
        const cols = Math.min(3, selectedImages.length)
        const imgWidth = (canvas.width - 40) / cols
        const imgHeight = (canvas.height - 80) / Math.ceil(selectedImages.length / cols)

        selectedImages.forEach((img, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const x = 20 + col * imgWidth
          const y = 60 + row * imgHeight
          ctx.drawImage(img, x, y, imgWidth - 10, imgHeight - 10)
        })
      } else if (layout === "rows") {
        const rows = Math.min(3, selectedImages.length)
        const imgHeight = (canvas.height - 80) / rows
        const imgWidth = (canvas.width - 40) / Math.ceil(selectedImages.length / rows)

        selectedImages.forEach((img, i) => {
          const row = i % rows
          const col = Math.floor(i / rows)
          const x = 20 + col * imgWidth
          const y = 60 + row * imgHeight
          ctx.drawImage(img, x, y, imgWidth - 10, imgHeight - 10)
        })
      } else if (layout === "mosaic") {
        // Simple mosaic layout
        if (selectedImages.length === 2) {
          ctx.drawImage(selectedImages[0], 20, 60, (canvas.width - 50) / 2, canvas.height - 80)
          ctx.drawImage(selectedImages[1], canvas.width / 2 + 10, 60, (canvas.width - 50) / 2, canvas.height - 80)
        } else if (selectedImages.length >= 3) {
          ctx.drawImage(selectedImages[0], 20, 60, (canvas.width - 50) / 2, (canvas.height - 90) / 2)
          ctx.drawImage(selectedImages[1], canvas.width / 2 + 10, 60, (canvas.width - 50) / 2, (canvas.height - 90) / 2)

          const remainingHeight = (canvas.height - 90) / 2
          const remainingWidth = (canvas.width - 40) / Math.min(selectedImages.length - 2, 3)

          for (let i = 2; i < Math.min(selectedImages.length, 5); i++) {
            const x = 20 + (i - 2) * remainingWidth
            ctx.drawImage(selectedImages[i], x, canvas.height / 2 + 30, remainingWidth - 10, remainingHeight - 10)
          }
        }
      }

      // Add border
      ctx.strokeStyle = "#333333"
      ctx.lineWidth = 2
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

      return canvas.toDataURL("image/png")
    } catch (error) {
      console.error("Error creating collage:", error)
      return null
    }
  }

  const handleCreateCollage = async () => {
    if (selectedMemories.length < 2) {
      toast({
        title: "Not enough photos",
        description: "Please select at least 2 photos for your collage.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Create actual collage
      const collageDataUrl = await createCollageCanvas()

      if (collageDataUrl) {
        setCollagePreview(collageDataUrl)

        toast({
          title: "Collage created!",
          description: "Your collage has been created successfully.",
          variant: "success",
        })
      } else {
        throw new Error("Failed to create collage")
      }
    } catch (error) {
      console.error("Error creating collage:", error)
      toast({
        title: "Error",
        description: "Failed to create collage. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDownload = () => {
    if (!collagePreview) return

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = collagePreview
    link.download = `${collageTitle.replace(/\s+/g, "-").toLowerCase()}.png`
    document.body.appendChild(link)

    // Trigger download
    link.click()

    // Clean up
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "Your collage is being downloaded.",
      variant: "success",
    })
  }

  const handleShare = () => {
    toast({
      title: "Share",
      description: "Sharing functionality will be available soon.",
    })
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

  if (photoMemories.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Memory Collages</h1>
        <EmptyState
          title="No photos found"
          description="Add some photo memories to create collages"
          action={
            <Button asChild>
              <Link href="/upload">
                <Plus className="h-4 w-4 mr-2" />
                Add Photo Memory
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Memory Collages</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Requirements</AlertTitle>
        <AlertDescription>
          To create a collage, you need to select at least 2 photos. The more photos you select, the more interesting
          your collage will be!
        </AlertDescription>
      </Alert>

      {/* Hidden canvas for generating collage */}
      <canvas ref={canvasRef} style={{ display: "none" }} width="800" height="600"></canvas>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collage Settings</CardTitle>
              <CardDescription>Customize your memory collage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={collageTitle} onChange={(e) => setCollageTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Layout</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={layout === "grid" ? "default" : "outline"}
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setLayout("grid")}
                  >
                    <Grid className="h-4 w-4" />
                    <span>Grid</span>
                  </Button>
                  <Button
                    variant={layout === "columns" ? "default" : "outline"}
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setLayout("columns")}
                  >
                    <Columns className="h-4 w-4" />
                    <span>Columns</span>
                  </Button>
                  <Button
                    variant={layout === "rows" ? "default" : "outline"}
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setLayout("rows")}
                  >
                    <Rows className="h-4 w-4" />
                    <span>Rows</span>
                  </Button>
                  <Button
                    variant={layout === "mosaic" ? "default" : "outline"}
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setLayout("mosaic")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>Mosaic</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background</Label>
                <Select defaultValue="white">
                  <SelectTrigger>
                    <SelectValue placeholder="Select background" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="pattern">Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Border Style</Label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue placeholder="Select border style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="thin">Thin</SelectItem>
                    <SelectItem value="thick">Thick</SelectItem>
                    <SelectItem value="polaroid">Polaroid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleCreateCollage}
                disabled={selectedMemories.length < 2 || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Collage"
                )}
              </Button>
            </CardContent>
          </Card>

          {collagePreview && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="aspect-[4/3] relative bg-muted rounded-md overflow-hidden">
                  <img
                    src={collagePreview || "/placeholder.svg"}
                    alt="Collage Preview"
                    className="w-full h-full object-contain"
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
              <CardTitle>Select Photos</CardTitle>
              <CardDescription>
                {selectedMemories.length} of {photoMemories.length} photos selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto p-1">
                {photoMemories.map((memory) => (
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
                      <img
                        src={memory.mediaUrl || "/placeholder.svg"}
                        alt={memory.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Checkbox
                          checked={selectedMemories.includes(memory.id)}
                          className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </div>
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

