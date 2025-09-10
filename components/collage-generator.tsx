"use client"

import { useState, useRef } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Grid, Layers, Circle, Slash, Heart, Wand2, ImageIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Memory, CollageLayout } from "@/types"

const LAYOUT_OPTIONS = [
  { id: "grid" as CollageLayout, name: "Grid", icon: Grid, description: "Classic grid layout" },
  { id: "mosaic" as CollageLayout, name: "Mosaic", icon: Layers, description: "Varied sizes mosaic" },
  { id: "circular" as CollageLayout, name: "Circular", icon: Circle, description: "Circular arrangement" },
  { id: "diagonal" as CollageLayout, name: "Diagonal", icon: Slash, description: "Diagonal flow" },
  { id: "heart" as CollageLayout, name: "Heart", icon: Heart, description: "Heart shape" },
]

export function CollageGenerator() {
  const { memories } = useMemories()
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [layout, setLayout] = useState<CollageLayout>("grid")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCollage, setGeneratedCollage] = useState<string | null>(null)

  // Filter memories to only photos
  const photoMemories = memories.filter((memory) => memory.type === "photo" && memory.mediaUrl)

  const handleMemoryToggle = (memoryId: string) => {
    setSelectedMemories((prev) =>
      prev.includes(memoryId) ? prev.filter((id) => id !== memoryId) : [...prev, memoryId],
    )
  }

  const generateCollage = async () => {
    if (selectedMemories.length < 2) {
      toast({
        title: "Not enough photos",
        description: "Please select at least 2 photos to create a collage.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas size
      canvas.width = 800
      canvas.height = 600

      // Clear canvas
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Load selected memory images
      const selectedMemoryObjects = selectedMemories
        .map((id) => memories.find((m) => m.id === id))
        .filter(Boolean) as Memory[]

      const imagePromises = selectedMemoryObjects.map((memory) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = memory.mediaUrl!
        })
      })

      const images = await Promise.all(imagePromises)

      // Apply layout
      await applyLayout(ctx, images, layout, canvas.width, canvas.height)

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png", 0.9)
      setGeneratedCollage(dataUrl)

      toast({
        title: "Collage created!",
        description: "Your beautiful collage is ready to download.",
      })
    } catch (error) {
      console.error("Error generating collage:", error)
      toast({
        title: "Error",
        description: "Failed to generate collage. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const applyLayout = async (
    ctx: CanvasRenderingContext2D,
    images: HTMLImageElement[],
    layout: CollageLayout,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    const padding = 10

    switch (layout) {
      case "grid":
        const cols = Math.ceil(Math.sqrt(images.length))
        const rows = Math.ceil(images.length / cols)
        const cellWidth = (canvasWidth - padding * (cols + 1)) / cols
        const cellHeight = (canvasHeight - padding * (rows + 1)) / rows

        images.forEach((img, index) => {
          const col = index % cols
          const row = Math.floor(index / cols)
          const x = padding + col * (cellWidth + padding)
          const y = padding + row * (cellHeight + padding)

          ctx.drawImage(img, x, y, cellWidth, cellHeight)
        })
        break

      case "mosaic":
        // Create varied size layout
        const positions = generateMosaicPositions(images.length, canvasWidth, canvasHeight, padding)
        images.forEach((img, index) => {
          const pos = positions[index]
          if (pos) {
            ctx.drawImage(img, pos.x, pos.y, pos.width, pos.height)
          }
        })
        break

      case "circular":
        const centerX = canvasWidth / 2
        const centerY = canvasHeight / 2
        const radius = Math.min(canvasWidth, canvasHeight) * 0.3
        const angleStep = (2 * Math.PI) / images.length

        images.forEach((img, index) => {
          const angle = index * angleStep
          const x = centerX + Math.cos(angle) * radius - 60
          const y = centerY + Math.sin(angle) * radius - 60
          ctx.drawImage(img, x, y, 120, 120)
        })
        break

      case "diagonal":
        const stepX = (canvasWidth - 120) / (images.length - 1 || 1)
        const stepY = (canvasHeight - 120) / (images.length - 1 || 1)

        images.forEach((img, index) => {
          const x = index * stepX
          const y = index * stepY
          ctx.drawImage(img, x, y, 120, 120)
        })
        break

      case "heart":
        const heartPositions = generateHeartPositions(images.length, canvasWidth, canvasHeight)
        images.forEach((img, index) => {
          const pos = heartPositions[index]
          if (pos) {
            ctx.drawImage(img, pos.x, pos.y, 80, 80)
          }
        })
        break
    }
  }

  const generateMosaicPositions = (count: number, width: number, height: number, padding: number) => {
    const positions = []
    const sizes = [120, 100, 140, 110, 130] // Varied sizes

    for (let i = 0; i < count; i++) {
      const size = sizes[i % sizes.length]
      const x = Math.random() * (width - size - padding * 2) + padding
      const y = Math.random() * (height - size - padding * 2) + padding

      positions.push({ x, y, width: size, height: size })
    }

    return positions
  }

  const generateHeartPositions = (count: number, width: number, height: number) => {
    const positions = []
    const centerX = width / 2
    const centerY = height / 2
    const scale = Math.min(width, height) * 0.002

    for (let i = 0; i < count; i++) {
      const t = (i / count) * 2 * Math.PI
      // Heart equation: x = 16sin³(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
      const x = centerX + scale * 16 * Math.pow(Math.sin(t), 3) - 40
      const y = centerY - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 40

      positions.push({ x, y })
    }

    return positions
  }

  const downloadCollage = () => {
    if (!generatedCollage) return

    const link = document.createElement("a")
    link.download = `${title || "collage"}-${Date.now()}.png`
    link.href = generatedCollage
    link.click()

    toast({
      title: "Downloaded!",
      description: "Your collage has been saved to your device.",
    })
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create Memory Collage</h1>
        <p className="text-muted-foreground">
          Combine your favorite photos into beautiful collages with various layouts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          {/* Collage Details */}
          <Card>
            <CardHeader>
              <CardTitle>Collage Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input placeholder="My Beautiful Collage" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="A collection of my favorite memories..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Layout Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {LAYOUT_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <Button
                      key={option.id}
                      variant={layout === option.id ? "default" : "outline"}
                      className="h-auto p-4 flex-col space-y-2"
                      onClick={() => setLayout(option.id)}
                    >
                      <Icon className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">{option.name}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Photo Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Select Photos
                <Badge variant="secondary">{selectedMemories.length} selected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {photoMemories.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No photos available. Upload some photos first!</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {photoMemories.map((memory) => (
                    <div key={memory.id} className="relative">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={memory.mediaUrl || "/placeholder.svg"}
                          alt={memory.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Checkbox
                          checked={selectedMemories.includes(memory.id)}
                          onCheckedChange={() => handleMemoryToggle(memory.id)}
                          className="bg-white/90 border-white"
                        />
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{memory.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={generateCollage}
            disabled={selectedMemories.length < 2 || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Collage...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-2" />
                Generate Collage
              </>
            )}
          </Button>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                {generatedCollage ? (
                  <img
                    src={generatedCollage || "/placeholder.svg"}
                    alt="Generated collage"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Wand2 className="h-12 w-12 mx-auto mb-4" />
                    <p>Your collage will appear here</p>
                    <p className="text-sm">Select photos and click generate</p>
                  </div>
                )}
              </div>

              {generatedCollage && (
                <div className="mt-4 flex gap-2">
                  <Button onClick={downloadCollage} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => setGeneratedCollage(null)}>
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
