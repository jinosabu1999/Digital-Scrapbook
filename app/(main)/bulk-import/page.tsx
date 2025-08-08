"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Upload,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  X,
  Check,
  AlertCircle,
  Loader2,
  FolderOpen,
  Tag,
  MapPin,
} from "lucide-react"
import { useMemories } from "@/context/memory-context"
import { useToast } from "@/hooks/use-toast"
import { TagInput } from "@/components/tag-input"
import { MoodSelector } from "@/components/mood-selector"

interface FileWithPreview extends File {
  id: string
  preview?: string
  status: "pending" | "processing" | "success" | "error"
  error?: string
  tags: string[]
  location: string
  description: string
  mood?: string
}

export default function BulkImportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addMemory } = useMemories()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [globalTags, setGlobalTags] = useState<string[]>([])
  const [globalLocation, setGlobalLocation] = useState("")
  const [globalDescription, setGlobalDescription] = useState("")
  const [globalMood, setGlobalMood] = useState<string>("")
  const [applyGlobalSettings, setApplyGlobalSettings] = useState(true)
  const [autoGenerateTags, setAutoGenerateTags] = useState(true)

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return

      const newFiles: FileWithPreview[] = Array.from(selectedFiles).map((file) => {
        const id = Math.random().toString(36).substr(2, 9)
        const fileWithPreview: FileWithPreview = {
          ...file,
          id,
          status: "pending",
          tags: applyGlobalSettings ? globalTags : [],
          location: applyGlobalSettings ? globalLocation : "",
          description: applyGlobalSettings ? globalDescription : "",
          mood: applyGlobalSettings ? globalMood : "",
        }

        // Create preview for images
        if (file.type.startsWith("image/")) {
          const reader = new FileReader()
          reader.onload = (e) => {
            setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, preview: e.target?.result as string } : f)))
          }
          reader.readAsDataURL(file)
        }

        return fileWithPreview
      })

      setFiles((prev) => [...prev, ...newFiles])
    },
    [applyGlobalSettings, globalTags, globalLocation, globalDescription, globalMood],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const updateFile = (id: string, updates: Partial<FileWithPreview>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileImage className="h-5 w-5" />
    if (type.startsWith("video/")) return <FileVideo className="h-5 w-5" />
    if (type.startsWith("audio/")) return <FileAudio className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  const getFileType = (type: string): "photo" | "video" | "audio" | "text" => {
    if (type.startsWith("image/")) return "photo"
    if (type.startsWith("video/")) return "video"
    if (type.startsWith("audio/")) return "audio"
    return "text"
  }

  const generateAutoTags = (file: File): string[] => {
    const tags: string[] = []
    const fileName = file.name.toLowerCase()

    // Add type-based tags
    if (file.type.startsWith("image/")) tags.push("photo")
    if (file.type.startsWith("video/")) tags.push("video")
    if (file.type.startsWith("audio/")) tags.push("audio")

    // Add date-based tags
    const now = new Date()
    tags.push(now.getFullYear().toString())
    tags.push(now.toLocaleString("default", { month: "long" }).toLowerCase())

    // Add filename-based tags
    if (fileName.includes("screenshot")) tags.push("screenshot")
    if (fileName.includes("selfie")) tags.push("selfie")
    if (fileName.includes("family")) tags.push("family")
    if (fileName.includes("travel")) tags.push("travel")
    if (fileName.includes("food")) tags.push("food")
    if (fileName.includes("work")) tags.push("work")

    return tags
  }

  const processFiles = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    setProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        updateFile(file.id, { status: "processing" })

        // Simulate file processing delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Generate auto tags if enabled
        const finalTags = autoGenerateTags ? [...new Set([...file.tags, ...generateAutoTags(file)])] : file.tags

        // Create memory object
        const memoryData = {
          title: file.name.split(".")[0],
          description: file.description || `Imported from ${file.name}`,
          type: getFileType(file.type),
          mediaUrl: file.preview || URL.createObjectURL(file),
          tags: finalTags,
          location: file.location,
          mood: file.mood,
          date: new Date().toISOString(),
          isLiked: false,
          isTimeCapsule: false,
          isPublic: false,
        }

        // Add memory to context
        addMemory(memoryData)
        updateFile(file.id, { status: "success" })
      } catch (error) {
        console.error("Error processing file:", error)
        updateFile(file.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }

      setProgress(((i + 1) / files.length) * 100)
    }

    setIsProcessing(false)

    const successCount = files.filter((f) => f.status === "success").length
    const errorCount = files.filter((f) => f.status === "error").length

    toast({
      title: "Import Complete",
      description: `Successfully imported ${successCount} memories${errorCount > 0 ? `, ${errorCount} failed` : ""}.`,
    })

    if (successCount > 0) {
      setTimeout(() => {
        router.push("/memories")
      }, 2000)
    }
  }

  const applyGlobalSettingsToAll = () => {
    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        tags: [...new Set([...file.tags, ...globalTags])],
        location: globalLocation || file.location,
        description: globalDescription || file.description,
        mood: globalMood || file.mood,
      })),
    )
    toast({
      title: "Settings Applied",
      description: "Global settings have been applied to all files.",
    })
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Bulk Import</h1>
          <p className="text-muted-foreground mt-1">Import multiple memories at once</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="settings">Global Settings</TabsTrigger>
            <TabsTrigger value="review">Review & Import</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Select Files
                </CardTitle>
                <CardDescription>
                  Choose multiple files to import. Supported formats: images, videos, audio files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Support for JPG, PNG, MP4, MP3, and more</p>
                  <input
                    ref={fileInputRef}
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </div>

                {files.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Selected Files ({files.length})</h3>
                      <Button variant="outline" size="sm" onClick={() => setFiles([])} disabled={isProcessing}>
                        Clear All
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {files.map((file) => (
                        <Card key={file.id} className="relative">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {file.preview ? (
                                <img
                                  src={file.preview || "/placeholder.svg"}
                                  alt={file.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                  {getFileIcon(file.type)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {file.status === "pending" && <Badge variant="secondary">Pending</Badge>}
                                  {file.status === "processing" && (
                                    <Badge variant="default">
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Processing
                                    </Badge>
                                  )}
                                  {file.status === "success" && (
                                    <Badge variant="default" className="bg-green-500">
                                      <Check className="h-3 w-3 mr-1" />
                                      Success
                                    </Badge>
                                  )}
                                  {file.status === "error" && (
                                    <Badge variant="destructive">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Error
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(file.id)}
                                disabled={isProcessing}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Global Settings
                </CardTitle>
                <CardDescription>Apply these settings to all imported files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch id="apply-global" checked={applyGlobalSettings} onCheckedChange={setApplyGlobalSettings} />
                  <Label htmlFor="apply-global">Apply global settings to new files</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-tags" checked={autoGenerateTags} onCheckedChange={setAutoGenerateTags} />
                  <Label htmlFor="auto-tags">Auto-generate tags based on file content</Label>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="global-tags">Tags</Label>
                    <TagInput
                      tags={globalTags}
                      onTagsChange={setGlobalTags}
                      placeholder="Add tags that apply to all files..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="global-location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="global-location"
                        value={globalLocation}
                        onChange={(e) => setGlobalLocation(e.target.value)}
                        placeholder="Where were these memories created?"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="global-description">Description Template</Label>
                    <Textarea
                      id="global-description"
                      value={globalDescription}
                      onChange={(e) => setGlobalDescription(e.target.value)}
                      placeholder="A description that applies to all files..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Mood</Label>
                    <MoodSelector selectedMood={globalMood} onMoodChange={setGlobalMood} />
                  </div>
                </div>

                {files.length > 0 && (
                  <Button onClick={applyGlobalSettingsToAll} className="w-full">
                    Apply Settings to All Files
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Review & Import
                </CardTitle>
                <CardDescription>Review your files and start the import process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {files.length === 0 ? (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No files selected</p>
                    <p className="text-muted-foreground">Go back to the upload tab to select files</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="p-4 border rounded-lg">
                        <p className="text-2xl font-bold">{files.length}</p>
                        <p className="text-sm text-muted-foreground">Total Files</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-2xl font-bold">
                          {(files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)}MB
                        </p>
                        <p className="text-sm text-muted-foreground">Total Size</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-2xl font-bold">{files.filter((f) => f.status === "success").length}</p>
                        <p className="text-sm text-muted-foreground">Processed</p>
                      </div>
                    </div>

                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing files...</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button onClick={processFiles} disabled={isProcessing || files.length === 0} className="flex-1">
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Import {files.length} Files
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => router.push("/memories")} disabled={isProcessing}>
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
