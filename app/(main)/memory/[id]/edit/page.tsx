"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, MapPin, UploadIcon, X, Loader2 } from "lucide-react"
import { TagInput } from "@/components/tag-input"
import { Switch } from "@/components/ui/switch"
import { getFileDataUrl, isValidFileType, getFileSize } from "@/lib/file-utils"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EmptyState } from "@/components/empty-state"
import Link from "next/link"

export default function EditMemoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { getMemory, updateMemory, loading } = useMemories()
  const [memory, setMemory] = useState(getMemory(params.id))

  const [date, setDate] = useState<Date | undefined>(memory?.date)
  const [tags, setTags] = useState<string[]>(memory?.tags || [])
  const [isTimeCapsule, setIsTimeCapsule] = useState(memory?.isTimeCapsule || false)
  const [unlockDate, setUnlockDate] = useState<Date | undefined>(memory?.unlockDate)
  const [title, setTitle] = useState(memory?.title || "")
  const [description, setDescription] = useState(memory?.description || "")
  const [location, setLocation] = useState(memory?.location || "")
  const [textContent, setTextContent] = useState(memory?.content || "")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Popover states
  const [dateOpen, setDateOpen] = useState(false)
  const [unlockDateOpen, setUnlockDateOpen] = useState(false)

  // File upload states
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(memory?.mediaUrl || null)

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Update local state if memory changes
    const currentMemory = getMemory(params.id)
    if (currentMemory) {
      setMemory(currentMemory)
      setDate(currentMemory.date)
      setTags(currentMemory.tags)
      setIsTimeCapsule(currentMemory.isTimeCapsule)
      setUnlockDate(currentMemory.unlockDate)
      setTitle(currentMemory.title)
      setDescription(currentMemory.description || "")
      setLocation(currentMemory.location || "")
      setTextContent(currentMemory.content || "")
      setMediaPreview(currentMemory.mediaUrl || null)
    }
  }, [getMemory, params.id])

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
        description="The memory you're trying to edit doesn't exist or has been deleted."
        action={
          <Button asChild>
            <Link href="/memories">Back to Memories</Link>
          </Button>
        }
      />
    )
  }

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileType = memory.type === "photo" ? "image" : memory.type === "video" ? "video" : "audio"

    if (!isValidFileType(file, fileType as any)) {
      setError(`Please select a valid ${fileType} file`)
      return
    }

    const maxSize = memory.type === "photo" ? 10 : memory.type === "video" ? 100 : 50

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size should be less than ${maxSize}MB`)
      return
    }

    setError(null)
    setMediaFile(file)

    try {
      const dataUrl = await getFileDataUrl(file)
      setMediaPreview(dataUrl)
    } catch (err) {
      console.error("Error creating preview:", err)
      setError("Failed to create preview")
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Remove selected file
  const removeFile = () => {
    setMediaFile(null)
    setMediaPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Handle form submission
  const handleSave = async () => {
    setError(null)

    // Validate required fields
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!date) {
      setError("Date is required")
      return
    }

    if (isTimeCapsule && !unlockDate) {
      setError("Unlock date is required for time capsules")
      return
    }

    // Validate content based on type
    if (memory.type === "text" && !textContent.trim()) {
      setError("Please enter some text content")
      return
    }

    setIsSaving(true)

    try {
      // Update the memory
      updateMemory(params.id, {
        title,
        description: description || undefined,
        date: date as Date,
        location: location || undefined,
        tags,
        content: memory.type === "text" ? textContent : undefined,
        mediaUrl: mediaPreview || undefined,
        isTimeCapsule,
        unlockDate: isTimeCapsule ? unlockDate : undefined,
      })

      toast({
        title: "Success!",
        description: "Memory updated successfully!",
      })

      // Redirect to the memory detail page
      router.push(`/memory/${params.id}`)
    } catch (err) {
      console.error("Error updating memory:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-6">Edit Memory</h1>

      <Card>
        <CardHeader>
          <CardTitle>Memory Details</CardTitle>
          <CardDescription>Update the details of your memory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {memory.type !== "text" && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="media">{memory.type.charAt(0).toUpperCase() + memory.type.slice(1)}</Label>
              <div className="flex flex-col md:flex-row items-start gap-4">
                {!mediaPreview ? (
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 md:p-12 text-center hover:bg-accent transition-colors cursor-pointer w-full md:w-auto"
                    onClick={triggerFileInput}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <UploadIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <Input
                        id="media"
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={memory.type === "photo" ? "image/*" : memory.type === "video" ? "video/*" : "audio/*"}
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full md:w-1/2">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {memory.type === "photo" && (
                      <img
                        src={mediaPreview || "/placeholder.svg"}
                        alt="Preview"
                        className="rounded-lg object-cover w-full max-h-[300px]"
                      />
                    )}
                    {memory.type === "video" && (
                      <video src={mediaPreview} controls className="rounded-lg w-full max-h-[300px]" />
                    )}
                    {memory.type === "audio" && (
                      <div className="bg-muted p-4 rounded-lg">
                        <audio src={mediaPreview} controls className="w-full" />
                      </div>
                    )}
                    {mediaFile && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {mediaFile.name} ({getFileSize(mediaFile)})
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {memory.type === "text" && (
            <div className="grid w-full gap-1.5">
              <Label htmlFor="text">Text Content</Label>
              <Textarea
                id="text"
                placeholder="Write your thoughts, reflections, or notes here..."
                className="min-h-[200px]"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>
          )}

          <div className="grid w-full gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your memory a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            <Label htmlFor="date">Date</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
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

          <div className="flex items-center space-x-2">
            <Switch id="time-capsule" checked={isTimeCapsule} onCheckedChange={setIsTimeCapsule} />
            <Label htmlFor="time-capsule">Make this a Time Capsule</Label>
          </div>

          {isTimeCapsule && (
            <div className="grid w-full gap-1.5 pl-6 border-l-2 border-primary/20">
              <Label htmlFor="unlock-date">Unlock Date</Label>
              <Popover open={unlockDateOpen} onOpenChange={setUnlockDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="unlock-date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !unlockDate && "text-muted-foreground")}
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
              <p className="text-sm text-muted-foreground mt-1">This memory will be locked until the selected date.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
