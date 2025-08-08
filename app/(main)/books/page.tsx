"use client"

import { useState, useRef } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Book, Printer, Download, Share, Plus, Loader2, BookOpen, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function BooksPage() {
  const { memories, loading } = useMemories()
  const { toast } = useToast()
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [bookTitle, setBookTitle] = useState("My Memory Book")
  const [bookType, setBookType] = useState("photobook")
  const [isCreating, setIsCreating] = useState(false)
  const [bookPreview, setBookPreview] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Filter to only photo memories
  const photoMemories = memories.filter((memory) => memory.type === "photo" && memory.mediaUrl)

  const handleToggleMemory = (id: string) => {
    setSelectedMemories((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  const createBookPreview = async () => {
    if (selectedMemories.length < 5 || !canvasRef.current) return null

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

      // Draw book cover
      ctx.fillStyle = bookType === "photobook" ? "#f0f0f0" : "#e0e0ff"
      ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100)

      // Draw spine
      ctx.fillStyle = "#d0d0d0"
      ctx.fillRect(canvas.width / 2 - 10, 50, 20, canvas.height - 100)

      // Draw title
      ctx.fillStyle = "#333333"
      ctx.font = "bold 28px Arial"
      ctx.textAlign = "center"
      ctx.fillText(bookTitle, canvas.width / 2, 120)

      // Load selected images
      const selectedImages = []
      for (const id of selectedMemories.slice(0, 4)) {
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

      // Draw images on the cover
      if (selectedImages.length > 0) {
        const imgSize = 150
        const startX = canvas.width / 2 - (imgSize * 2 + 20) / 2
        const startY = 180

        selectedImages.forEach((img, i) => {
          const row = Math.floor(i / 2)
          const col = i % 2
          const x = startX + col * (imgSize + 20)
          const y = startY + row * (imgSize + 20)
          ctx.drawImage(img, x, y, imgSize, imgSize)

          // Draw frame
          ctx.strokeStyle = "#333"
          ctx.lineWidth = 2
          ctx.strokeRect(x, y, imgSize, imgSize)
        })
      }

      // Draw book type
      ctx.fillStyle = "#555555"
      ctx.font = "18px Arial"
      ctx.fillText(bookType === "photobook" ? "Photo Book" : "Digital Flipbook", canvas.width / 2, canvas.height - 80)

      return canvas.toDataURL("image/png")
    } catch (error) {
      console.error("Error creating book preview:", error)
      return null
    }
  }

  const handleCreateBook = async () => {
    if (selectedMemories.length < 5) {
      toast({
        title: "Not enough photos",
        description: "Please select at least 5 photos for your memory book.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Create actual book preview
      const bookDataUrl = await createBookPreview()

      if (bookDataUrl) {
        setBookPreview(bookDataUrl)

        toast({
          title: "Book created!",
          description: "Your memory book has been created successfully.",
          variant: "success",
        })
      } else {
        throw new Error("Failed to create book preview")
      }
    } catch (error) {
      console.error("Error creating memory book:", error)
      toast({
        title: "Error",
        description: "Failed to create memory book. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDownload = () => {
    if (!bookPreview) return

    // Create a temporary link element
    const link = document.createElement("a")
    link.href = bookPreview
    link.download = `${bookTitle.replace(/\s+/g, "-").toLowerCase()}.png`
    document.body.appendChild(link)

    // Trigger download
    link.click()

    // Clean up
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "Your memory book is being downloaded.",
      variant: "success",
    })
  }

  const handlePrint = () => {
    if (!bookPreview) return

    // Open a new window with the image
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Could not open print window. Please check your popup settings.",
        variant: "destructive",
      })
      return
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${bookTitle} - Print</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 100%; max-height: 100vh; }
          </style>
        </head>
        <body>
          <img src="${bookPreview}" alt="${bookTitle}">
          <script>
            setTimeout(() => { window.print(); }, 500);
          </script>
        </body>
      </html>
    `)

    toast({
      title: "Preparing for print",
      description: "Your memory book is being prepared for printing.",
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
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Memory Books</h1>
        <EmptyState
          title="No photos found"
          description="Add some photo memories to create a memory book"
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
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Memory Books</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Requirements</AlertTitle>
        <AlertDescription>
          To create a memory book, you need to select at least 5 photos. Books are a great way to organize and showcase
          your favorite memories in a structured format.
        </AlertDescription>
      </Alert>

      {/* Hidden canvas for generating book preview */}
      <canvas ref={canvasRef} style={{ display: "none" }} width="800" height="600"></canvas>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Book Settings</CardTitle>
              <CardDescription>Customize your memory book</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Book Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={bookType === "photobook" ? "default" : "outline"}
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setBookType("photobook")}
                  >
                    <Book className="h-4 w-4" />
                    <span>Photo Book</span>
                  </Button>
                  <Button
                    variant={bookType === "flipbook" ? "default" : "outline"}
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setBookType("flipbook")}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Flipbook</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Size</Label>
                <Select defaultValue="square">
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square (8×8″)</SelectItem>
                    <SelectItem value="landscape">Landscape (11×8.5″)</SelectItem>
                    <SelectItem value="portrait">Portrait (8.5×11″)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cover Style</Label>
                <Select defaultValue="hardcover">
                  <SelectTrigger>
                    <SelectValue placeholder="Select cover style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardcover">Hardcover</SelectItem>
                    <SelectItem value="softcover">Softcover</SelectItem>
                    <SelectItem value="leather">Leather Bound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleCreateBook}
                disabled={selectedMemories.length < 5 || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Book"
                )}
              </Button>
            </CardContent>
          </Card>

          {bookPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="aspect-[4/3] relative bg-muted rounded-md overflow-hidden">
                  <img
                    src={bookPreview || "/placeholder.svg"}
                    alt="Book Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {bookType === "photobook" ? (
                  <Button onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                ) : (
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
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
