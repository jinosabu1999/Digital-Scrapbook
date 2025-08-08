"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, X } from 'lucide-react'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useMemories } from "@/context/memory-context"
import { TagInput } from "@/components/tag-input"
import { MoodSelector } from "@/components/mood-selector"
import { useToast } from "@/hooks/use-toast"
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
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [isTimeCapsule, setIsTimeCapsule] = useState(false)
  const [unlockDate, setUnlockDate] = useState<Date>()
  const [mood, setMood] = useState<MoodType>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      // Create a URL for preview
      const url = URL.createObjectURL(file)
      // You might want to store this URL or handle it differently
    }
  }

  const validateForm = () => {
    const errors: string[] = []
    
    if (!title.trim()) errors.push("Title")
    if (!date) errors.push("Date")
    if (type !== "text" && !mediaFile) errors.push("Media file")
    if (type === "text" && !content.trim()) errors.push("Text content")
    if (isTimeCapsule && !unlockDate) errors.push("Unlock date for time capsule")
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast({
        title: "❌ Missing required fields",
        description: `Please provide: ${validationErrors.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create media URL from file if exists
      let mediaUrl = ""
      if (mediaFile) {
        mediaUrl = URL.createObjectURL(mediaFile)
      }

      const memoryData = {
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        location: location.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        type,
        content: content.trim() || undefined,
        mediaUrl: mediaUrl || undefined,
        isTimeCapsule,
        unlockDate: isTimeCapsule ? unlockDate : undefined,
        mood,
      }

      addMemory(memoryData)
      
      // Reset form
      setTitle("")
      setDescription("")
      setDate(new Date())
      setLocation("")
      setTags([])
      setType("photo")
      setContent("")
      setMediaFile(null)
      setIsTimeCapsule(false)
      setUnlockDate(undefined)
      setMood(undefined)

      // Navigate back to dashboard
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save memory. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Memory</CardTitle>
          <CardDescription>
            Capture and preserve your precious moments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your memory a title..."
                className={cn(!title.trim() && "border-red-300")}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell the story behind this memory..."
                rows={3}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground border-red-300"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where was this memory made?"
              />
            </div>

            {/* Memory Type */}
            <div className="space-y-2">
              <Label>Memory Type</Label>
              <Select value={type} onValueChange={(value: MemoryType) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">📸 Photo</SelectItem>
                  <SelectItem value="video">🎥 Video</SelectItem>
                  <SelectItem value="audio">🎵 Audio</SelectItem>
                  <SelectItem value="text">📝 Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Media Upload */}
            {type !== "text" && (
              <div className="space-y-2">
                <Label htmlFor="media">Upload {type} *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="media"
                    type="file"
                    onChange={handleFileChange}
                    accept={
                      type === "photo" ? "image/*" :
                      type === "video" ? "video/*" :
                      type === "audio" ? "audio/*" : "*/*"
                    }
                    className="hidden"
                  />
                  <Label htmlFor="media" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    {mediaFile && (
                      <p className="mt-2 text-sm text-green-600">
                        Selected: {mediaFile.name}
                      </p>
                    )}
                  </Label>
                </div>
              </div>
            )}

            {/* Text Content */}
            {type === "text" && (
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your memory here..."
                  rows={6}
                  className={cn(!content.trim() && "border-red-300")}
                />
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput
                tags={tags}
                onTagsChange={setTags}
                placeholder="Add tags to organize your memory..."
              />
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <Label>Mood</Label>
              <MoodSelector value={mood} onValueChange={setMood} />
            </div>

            {/* Time Capsule */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="time-capsule"
                  checked={isTimeCapsule}
                  onCheckedChange={setIsTimeCapsule}
                />
                <Label htmlFor="time-capsule">Make this a time capsule</Label>
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
                          !unlockDate && "text-muted-foreground border-red-300"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {unlockDate ? format(unlockDate, "PPP") : "When should this unlock?"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={unlockDate}
                        onSelect={setUnlockDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Memory"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
