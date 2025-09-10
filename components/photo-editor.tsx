"use client"

import { useState, useRef, useEffect } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Save,
  RotateCcw,
  Palette,
  Sun,
  Contrast,
  Droplets,
  Zap,
  Camera,
  Image as Vintage,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Memory } from "@/types"

interface PhotoEffects {
  brightness: number
  contrast: number
  saturation: number
  hue: number
  blur: number
  sepia: number
  grayscale: number
  vintage: number
  vignette: number
}

const DEFAULT_EFFECTS: PhotoEffects = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  sepia: 0,
  grayscale: 0,
  vintage: 0,
  vignette: 0,
}

const FILTER_PRESETS = [
  {
    name: "Original",
    effects: DEFAULT_EFFECTS,
  },
  {
    name: "Vintage",
    effects: { ...DEFAULT_EFFECTS, sepia: 40, contrast: 110, saturation: 80, vintage: 30 },
  },
  {
    name: "Black & White",
    effects: { ...DEFAULT_EFFECTS, grayscale: 100, contrast: 120 },
  },
  {
    name: "Warm",
    effects: { ...DEFAULT_EFFECTS, hue: 10, saturation: 110, brightness: 105 },
  },
  {
    name: "Cool",
    effects: { ...DEFAULT_EFFECTS, hue: -10, saturation: 90, brightness: 95 },
  },
  {
    name: "Dramatic",
    effects: { ...DEFAULT_EFFECTS, contrast: 140, saturation: 120, vignette: 30 },
  },
  {
    name: "Soft",
    effects: { ...DEFAULT_EFFECTS, blur: 1, brightness: 110, contrast: 90 },
  },
  {
    name: "Vibrant",
    effects: { ...DEFAULT_EFFECTS, saturation: 150, contrast: 115, brightness: 105 },
  },
]

interface PhotoEditorProps {
  memory: Memory
  onClose?: () => void
}

export function PhotoEditor({ memory, onClose }: PhotoEditorProps) {
  const { updateMemory } = useMemories()
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalImageRef = useRef<HTMLImageElement | null>(null)

  const [effects, setEffects] = useState<PhotoEffects>(DEFAULT_EFFECTS)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (memory.mediaUrl) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        originalImageRef.current = img
        setImageLoaded(true)
        applyEffects()
      }
      img.src = memory.mediaUrl
    }
  }, [memory.mediaUrl])

  useEffect(() => {
    if (imageLoaded) {
      applyEffects()
    }
  }, [effects, imageLoaded])

  const applyEffects = () => {
    const canvas = canvasRef.current
    const img = originalImageRef.current

    if (!canvas || !img) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match image
    canvas.width = img.width
    canvas.height = img.height

    // Apply CSS filters to context
    const filterString = [
      `brightness(${effects.brightness}%)`,
      `contrast(${effects.contrast}%)`,
      `saturate(${effects.saturation}%)`,
      `hue-rotate(${effects.hue}deg)`,
      `blur(${effects.blur}px)`,
      `sepia(${effects.sepia}%)`,
      `grayscale(${effects.grayscale}%)`,
    ].join(" ")

    ctx.filter = filterString
    ctx.drawImage(img, 0, 0)

    // Apply vintage effect
    if (effects.vintage > 0) {
      ctx.globalCompositeOperation = "multiply"
      ctx.fillStyle = `rgba(255, 204, 153, ${(effects.vintage / 100) * 0.3})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = "source-over"
    }

    // Apply vignette effect
    if (effects.vignette > 0) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.max(canvas.width, canvas.height) * 0.6

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      gradient.addColorStop(0, `rgba(0, 0, 0, 0)`)
      gradient.addColorStop(1, `rgba(0, 0, 0, ${(effects.vignette / 100) * 0.6})`)

      ctx.globalCompositeOperation = "multiply"
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = "source-over"
    }

    // Reset filter for future operations
    ctx.filter = "none"
  }

  const handleEffectChange = (effectName: keyof PhotoEffects, value: number[]) => {
    setEffects((prev) => ({
      ...prev,
      [effectName]: value[0],
    }))
  }

  const applyPreset = (preset: (typeof FILTER_PRESETS)[0]) => {
    setEffects(preset.effects)
  }

  const resetEffects = () => {
    setEffects(DEFAULT_EFFECTS)
  }

  const saveEffects = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsSaving(true)

    try {
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9)

      // Update memory with new image and applied filter info
      updateMemory(memory.id, {
        mediaUrl: dataUrl,
        appliedFilter: JSON.stringify(effects),
      })

      toast({
        title: "Effects applied!",
        description: "Your photo has been updated with the new effects.",
      })

      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error("Error saving effects:", error)
      toast({
        title: "Error",
        description: "Failed to save effects. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `${memory.title || "edited-photo"}-${Date.now()}.jpg`
    link.href = canvas.toDataURL("image/jpeg", 0.9)
    link.click()

    toast({
      title: "Downloaded!",
      description: "Your edited photo has been saved to your device.",
    })
  }

  if (!memory.mediaUrl || memory.type !== "photo") {
    return (
      <div className="text-center py-8">
        <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">This memory doesn't contain a photo to edit.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Photo Editor</h1>
        <p className="text-muted-foreground">Apply beautiful effects and filters to "{memory.title}"</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {!imageLoaded ? (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading image...</p>
                  </div>
                ) : (
                  <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={saveEffects} disabled={isSaving || !imageLoaded}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={downloadImage} disabled={!imageLoaded}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={resetEffects}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                {onClose && (
                  <Button variant="ghost" onClick={onClose}>
                    Close
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Filter Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {FILTER_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="text-xs"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Manual Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Manual Adjustments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="effects">Effects</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 mt-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="h-4 w-4" />
                      <label className="text-sm font-medium">Brightness</label>
                      <Badge variant="outline" className="text-xs">
                        {effects.brightness}%
                      </Badge>
                    </div>
                    <Slider
                      value={[effects.brightness]}
                      onValueChange={(value) => handleEffectChange("brightness", value)}
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Contrast className="h-4 w-4" />
                      <label className="text-sm font-medium">Contrast</label>
                      <Badge variant="outline" className="text-xs">
                        {effects.contrast}%
                      </Badge>
                    </div>
                    <Slider
                      value={[effects.contrast]}
                      onValueChange={(value) => handleEffectChange("contrast", value)}
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="h-4 w-4" />
                      <label className="text-sm font-medium">Saturation</label>
                      <Badge variant="outline" className="text-xs">
                        {effects.saturation}%
                      </Badge>
                    </div>
                    <Slider
                      value={[effects.saturation]}
                      onValueChange={(value) => handleEffectChange("saturation", value)}
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="h-4 w-4" />
                      <label className="text-sm font-medium">Hue</label>
                      <Badge variant="outline" className="text-xs">
                        {effects.hue}°
                      </Badge>
                    </div>
                    <Slider
                      value={[effects.hue]}
                      onValueChange={(value) => handleEffectChange("hue", value)}
                      min={-180}
                      max={180}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="effects" className="space-y-6 mt-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium">Blur</label>
                      <Badge variant="outline" className="text-xs">
                        {effects.blur}px
                      </Badge>
                    </div>
                    <Slider
                      value={[effects.blur]}
                      onValueChange={(value) => handleEffectChange("blur", value)}
                      min={0}
                      max={10}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium">Sepia</label>
                      <Badge variant="outline" className="text-xs">
                        {effects.sepia}%
                      </Badge>
                    </div>
                    <Slider
                      value={[effects.sepia]}
                      onValueChange={(value) => handleEffectChange("sepia", value)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium">Grayscale</label>
                      <Badge variant="outline" className="text-xs">
                        {effects.grayscale}%
                      </Badge>
                    </div>
                    <Slider
                      value={[effects.grayscale]}
                      onValueChange={(value) => handleEffectChange("grayscale", value)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Vintage className="h-4 w-4" />
                      <label className="text-sm font-medium">Vintage</label>
                      <Badge variant="outline" className="text-xs">
                        {effects.vintage}%
                      </Badge>
                    </div>
                    <Slider
                      value={[effects.vintage]}
                      onValueChange={(value) => handleEffectChange("vintage", value)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium">Vignette</label>
                      <Badge variant="outline" className="text-xs">
                        {effects.vignette}%
                      </Badge>
                    </div>
                    <Slider
                      value={[effects.vignette]}
                      onValueChange={(value) => handleEffectChange("vignette", value)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
