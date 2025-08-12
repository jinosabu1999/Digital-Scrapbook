"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TagInput } from "@/components/tag-input"
import { MoodSelector } from "@/components/mood-selector"
import { useToast } from "@/hooks/use-toast"
import {
  CalendarIcon,
  Upload,
  ImageIcon,
  Video,
  Mic,
  FileText,
  MapPin,
  Clock,
  XCircle,
  CheckCircle,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useMemories } from "@/context/memory-context"
import type { MemoryType, MoodType } from "@/types"

export default function UploadPage() {
  const router = useRouter()
  const { addMemory } = useMemories()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [location, setLocation] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [type, setType] = useState<MemoryType>("photo")
  const [content, setContent] = useState("")
  const [mediaUrl, setMediaUrl] = useState("") // Stores Base64 string
  const [mediaFileName, setMediaFileName] = useState("")
  const [isTimeCapsule, setIsTimeCapsule] = useState(false)
  const [unlockDate, setUnlockDate] = useState<Date | undefined>(undefined)
  const [mood, setMood] = useState<MoodType | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Auto-detect type based on file
      if (file.type.startsWith("image/")) {
        setType("photo")
      } else if (file.type.startsWith("video/")) {
        setType("video")
      } else if (file.type.startsWith("audio/")) {
        setType("audio")
      }
    } else {
      setMediaFileName("")
      setMediaUrl("")
    }
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!title.trim()) errors.push("Title")
    if (!date) errors.push("Date")
    if (type !== "text" && !mediaUrl) errors.push("Media file")
    if (type === "text" && !content.trim()) errors.push("Text content")
    if (isTimeCapsule && !unlockDate) errors.push("Unlock date for time capsule")

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast({
        title: "⚠️ Missing Required Fields",
        description: `Please provide: ${validationErrors.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const memoryData = {
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        location: location.trim() || undefined,
        tags: tags || [], // Ensure tags is always an array
        type,
        content: type === "text" ? content.trim() || undefined : undefined,
        mediaUrl: type !== "text" ? mediaUrl || undefined : undefined,
        isTimeCapsule,
        unlockDate: isTimeCapsule ? unlockDate : undefined,
        mood,
      }

      const memoryId = addMemory(memoryData)

      // Reset form
      setTitle("")
      setDescription("")
      setDate(new Date())
      setLocation("")
      setTags([])
      setType("photo")
      setContent("")
      setMediaUrl("")
      setMediaFileName("")
      setIsTimeCapsule(false)
      setUnlockDate(undefined)
      setMood(undefined)

      router.push(`/memory/${memoryId}`)
    } catch (error) {
      console.error("Error creating memory:", error)
      toast({
        title: "❌ Error",
        description: "Failed to create memory. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Memory</h1>
          <p className="text-muted-foreground">Capture and preserve your precious moments</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your memory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your memory a title..."
                  className={cn(!title.trim() && "border-red-300 focus:border-red-500")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your memory..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground border-red-300",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Where was this?"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Media & Content</CardTitle>
              <CardDescription>Add photos, videos, audio, or text content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Memory Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: "photo", icon: ImageIcon, label: "Photo" },
                    { value: "video", icon: Video, label: "Video" },
                    { value: "audio", icon: Mic, label: "Audio" },
                    { value: "text", icon: FileText, label: "Text" },
                  ].map(({ value, icon: Icon, label }) => (
                    <Button
                      key={value}
                      type="button"
                      variant={type === value ? "default" : "outline"}
                      onClick={() => {
                        setType(value as MemoryType)
                        // Clear media/content if type changes
                        if (value === "text") {
                          setMediaUrl("")
                          setMediaFileName("")
                        } else {
                          setContent("")
                        }
                      }}
                      className="h-12 flex-col space-y-1"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {type !== "text" && (
                <div className="space-y-2">
                  <Label htmlFor="media">Upload File *</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center",
                      !mediaUrl && "border-red-300 focus-within:border-red-500",
                      mediaUrl && "border-green-500",
                    )}
                  >
                    <input
                      id="media"
                      type="file"
                      onChange={handleFileUpload}
                      accept={
                        type === "photo"
                          ? "image/*"
                          : type === "video"
                            ? "video/*"
                            : type === "audio"
                              ? "audio/*"
                              : "*/*"
                      }
                      className="hidden"
                    />
                    <Label htmlFor="media" className="cursor-pointer block">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                      {mediaFileName && (
                        <p className="mt-2 text-sm flex items-center justify-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Selected: {mediaFileName}
                        </p>
                      )}
                      {!mediaFileName && !mediaUrl && (
                        <p className="mt-2 text-sm flex items-center justify-center text-red-500">
                          <XCircle className="h-4 w-4 mr-1" />
                          No file selected
                        </p>
                      )}
                    </Label>
                  </div>
                </div>
              )}

              {type === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your memory content here..."
                    rows={4}
                    className={cn(!content.trim() && "border-red-300 focus:border-red-500")}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags and Mood */}
          <Card>
            <CardHeader>
              <CardTitle>Tags & Mood</CardTitle>
              <CardDescription>Organize and categorize your memory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TagInput tags={tags} onTagsChange={setTags} placeholder="Add tags to organize your memory..." />

              <MoodSelector selectedMood={mood} onMoodChange={setMood} />
            </CardContent>
          </Card>

          {/* Time Capsule */}
          <Card>
            <CardHeader>
              <CardTitle>Time Capsule</CardTitle>
              <CardDescription>Lock this memory until a future date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="timecapsule" checked={isTimeCapsule} onCheckedChange={setIsTimeCapsule} />
                <Label htmlFor="timecapsule" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Make this a time capsule
                </Label>
              </div>

              {isTimeCapsule && (
                <div className="space-y-2">
                  <Label>Unlock Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !unlockDate && "text-muted-foreground border-red-300",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {unlockDate ? format(unlockDate, "PPP") : "Pick unlock date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={unlockDate}
                        onSelect={setUnlockDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-muted-foreground">This memory will be hidden until the unlock date</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Save Memory
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
