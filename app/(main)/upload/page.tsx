"use client"

import { useState, useRef, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, ImageIcon, Video, Mic, FileText, MapPin, UploadIcon, X, Loader2, AlertCircle } from 'lucide-react'
import { TagInput } from "@/components/tag-input"
import { Switch } from "@/components/ui/switch"
import { useMemories, type MemoryType } from "@/context/memory-context"
import { getFileDataUrl, isValidFileType, getFileSize } from "@/lib/file-utils"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MoodSelector, type MoodType } from "@/components/mood-selector"

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addMemory } = useMemories()

  const [activeTab, setActiveTab] = useState<MemoryType>("photo")
  const [date, setDate] = useState<Date>()
  const [tags, setTags] = useState<string[]>([])
  const [isTimeCapsule, setIsTimeCapsule] = useState(false)
  const [unlockDate, setUnlockDate] = useState<Date>()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [textContent, setTextContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>()

  // Popover states
  const [dateOpen, setDateOpen] = useState(false)
  const [unlockDateOpen, setUnlockDateOpen] = useState(false)

  // File upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)

  // Refs for file inputs
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  // Handle date selection
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setDateOpen(false)
  }

  // Handle unlock date selection
  const handleUnlockDateSelect = (selectedDate: Date | undefined) => {
    setUnlockDate(selectedDate)
    setUnlockDateOpen(false)
  }

  // Handle file selection for photos
  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isValidFileType(file, "image")) {
      setError("Please select a valid image file (JPEG, PNG, GIF)")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB")
      return
    }

    setError(null)
    setPhotoFile(file)

    try {
      const dataUrl = await getFileDataUrl(file)
      setPhotoPreview(dataUrl)

      // Preload the image to check dimensions
      const img = new Image()
      img.onload = () => {
        console.log(`Image loaded: ${img.width}x${img.height}`)
      }
      img.src = dataUrl
    } catch (err) {
      console.error("Error creating preview:", err)
      setError("Failed to create preview")
    }
  }

  // Handle file selection for videos
  const handleVideoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isValidFileType(file, "video")) {
      setError("Please select a valid video file (MP4, WebM, QuickTime)")
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("Video size should be less than 100MB")
      return
    }

    setError(null)
    setVideoFile(file)

    try {
      const dataUrl = await getFileDataUrl(file)
      setVideoPreview(dataUrl)
    } catch (err) {
      console.error("Error creating preview:", err)
      setError("Failed to create preview")
    }
  }

  // Handle file selection for audio
  const handleAudioChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isValidFileType(file, "audio")) {
      setError("Please select a valid audio file (MP3, WAV, OGG)")
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("Audio size should be less than 50MB")
      return
    }

    setError(null)
    setAudioFile(file)

    try {
      const dataUrl = await getFileDataUrl(file)
      setAudioPreview(dataUrl)
    } catch (err) {
      console.error("Error creating preview:", err)
      setError("Failed to create preview")
    }
  }

  // Trigger file input click
  const triggerFileInput = (type: MemoryType) => {
    if (type === "photo" && photoInputRef.current) {
      photoInputRef.current.click()
    } else if (type === "video" && videoInputRef.current) {
      videoInputRef.current.click()
    } else if (type === "audio" && audioInputRef.current) {
      audioInputRef.current.click()
    }
  }

  // Remove selected file
  const removeFile = (type: MemoryType) => {
    if (type === "photo") {
      setPhotoFile(null)
      setPhotoPreview(null)
      if (photoInputRef.current) photoInputRef.current.value = ""
    } else if (type === "video") {
      setVideoFile(null)
      setVideoPreview(null)
      if (videoInputRef.current) videoInputRef.current.value = ""
    } else if (type === "audio") {
      setAudioFile(null)
      setAudioPreview(null)
      if (audioInputRef.current) audioInputRef.current.value = ""
    }
  }

  // Handle form submission with improved validation
  const handleSave = async () => {
    setError(null)
    const missingFields: string[] = []

    // Validate required fields
    if (!title.trim()) {
      missingFields.push("Title")
    }

    if (!date) {
      missingFields.push("Date")
    }

    if (isTimeCapsule && !unlockDate) {
      missingFields.push("Unlock date for time capsule")
    }

    // Validate media based on type
    if (activeTab === "photo" && !photoFile) {
      missingFields.push("Photo upload")
    }

    if (activeTab === "video" && !videoFile) {
      missingFields.push("Video upload")
    }

    if (activeTab === "audio" && !audioFile) {
      missingFields.push("Audio upload")
    }

    if (activeTab === "text" && !textContent.trim()) {
      missingFields.push("Text content")
    }

    // Show improved validation toast
    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Information",
        description: `Please provide: ${missingFields.join(", ")}`,
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    setIsSaving(true)

    try {
      // Get the appropriate media URL based on the active tab
      let mediaUrl = null
      if (activeTab === "photo") mediaUrl = photoPreview
      else if (activeTab === "video") mediaUrl = videoPreview
      else if (activeTab === "audio") mediaUrl = audioPreview

      // Add the memory to our context
      const memoryId = addMemory({
        title,
        description: description || undefined,
        date: date as Date,
        location: location || undefined,
        tags,
        type: activeTab,
        content: activeTab === "text" ? textContent : undefined,
        mediaUrl: mediaUrl || undefined,
        isTimeCapsule,
        unlockDate: isTimeCapsule ? unlockDate : undefined,
        mood: selectedMood,
      })

      toast({
        title: "Memory Saved Successfully! 🎉",
        description: "Your memory has been added to your collection",
        duration: 3000,
      })

      // Redirect to the memory detail page
      router.push(`/memory/${memoryId}`)
    } catch (err) {
      console.error("Error saving memory:", err)
      toast({
        title: "Save Failed",
        description: "Something went wrong while saving your memory. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Add New Memory</h1>

      <Tabs
        defaultValue="photo"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as MemoryType)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="photo" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Photo</span>
            <span className="sm:hidden">📷</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Video</span>
            <span className="sm:hidden">🎥</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Audio</span>
            <span className="sm:hidden">🎤</span>
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Text</span>
            <span className="sm:hidden">📝</span>
          </TabsTrigger>
        </TabsList>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Memory Details</CardTitle>
            <CardDescription>Fill in the details about your memory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <TabsContent value="photo" className="mt-0 space-y-6">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="picture">Picture</Label>
                <div className="flex flex-col md:flex-row items-start gap-4">
                  {!photoPreview ? (
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 md:p-12 text-center hover:bg-accent transition-colors cursor-pointer w-full md:w-auto"
                      onClick={() => triggerFileInput("photo")}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <UploadIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 10MB</p>
                        <Input
                          id="picture"
                          ref={photoInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full md:w-1/2">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                        onClick={() => removeFile("photo")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div
                        className="bg-muted rounded-lg flex items-center justify-center"
                        style={{ maxHeight: "300px", height: "300px" }}
                      >
                        <img
                          src={photoPreview || "/placeholder.svg"}
                          alt="Preview"
                          className="max-w-full max-h-[300px] object-contain rounded-lg"
                        />
                      </div>
                      {photoFile && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {photoFile.name} ({getFileSize(photoFile)})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="video" className="mt-0 space-y-6">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="video">Video</Label>
                <div className="flex flex-col md:flex-row items-start gap-4">
                  {!videoPreview ? (
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 md:p-12 text-center hover:bg-accent transition-colors cursor-pointer w-full md:w-auto"
                      onClick={() => triggerFileInput("video")}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <UploadIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">MP4, MOV up to 100MB</p>
                        <Input
                          id="video"
                          ref={videoInputRef}
                          type="file"
                          className="hidden"
                          accept="video/*"
                          onChange={handleVideoChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full md:w-2/3">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                        onClick={() => removeFile("video")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <video src={videoPreview} controls className="rounded-lg w-full max-h-[300px]" />
                      {videoFile && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {videoFile.name} ({getFileSize(videoFile)})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="mt-0 space-y-6">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="audio">Audio</Label>
                <div className="flex flex-col md:flex-row items-start gap-4">
                  {!audioPreview ? (
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 md:p-12 text-center hover:bg-accent transition-colors cursor-pointer w-full md:w-auto"
                      onClick={() => triggerFileInput("audio")}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <UploadIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">MP3, WAV up to 50MB</p>
                        <Input
                          id="audio"
                          ref={audioInputRef}
                          type="file"
                          className="hidden"
                          accept="audio/*"
                          onChange={handleAudioChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                        onClick={() => removeFile("audio")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="bg-muted p-4 rounded-lg">
                        <audio src={audioPreview} controls className="w-full" />
                        {audioFile && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {audioFile.name} ({getFileSize(audioFile)})
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="text" className="mt-0 space-y-6">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="text">Text Memory</Label>
                <Textarea
                  id="text"
                  placeholder="Write your thoughts, reflections, or notes here..."
                  className="min-h-[200px]"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </div>
            </TabsContent>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Give your memory a title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={!title.trim() ? "border-red-300 focus:border-red-500" : ""}
              />
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description for your memory"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="date">Date *</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal", 
                      !date && "text-muted-foreground",
                      !date && "border-red-300"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="location">Location</Label>
              <div className="flex">
                <Input
                  id="location"
                  placeholder="Add a location"
                  className="rounded-r-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Button variant="outline" className="rounded-l-none border-l-0 bg-transparent">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid w-full gap-1.5">
              <Label>Tags</Label>
              <TagInput placeholder="Add tags (press Enter)" tags={tags} setTags={setTags} className="w-full" />
            </div>

            <MoodSelector selectedMood={selectedMood} onMoodChange={setSelectedMood} />

            <div className="flex items-center space-x-2">
              <Switch id="time-capsule" checked={isTimeCapsule} onCheckedChange={setIsTimeCapsule} />
              <Label htmlFor="time-capsule">Make this a Time Capsule</Label>
            </div>

            {isTimeCapsule && (
              <div className="grid w-full gap-1.5 pl-6 border-l-2 border-primary/20">
                <Label htmlFor="unlock-date">Unlock Date *</Label>
                <Popover open={unlockDateOpen} onOpenChange={setUnlockDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="unlock-date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !unlockDate && "text-muted-foreground",
                        isTimeCapsule && !unlockDate && "border-red-300"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {unlockDate ? format(unlockDate, "PPP") : "Select unlock date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={unlockDate}
                      onSelect={handleUnlockDateSelect}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground mt-1">
                  This memory will be locked until the selected date.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Memory"
              )}
            </Button>
          </CardFooter>
        </Card>
      </Tabs>
    </div>
  )
}
