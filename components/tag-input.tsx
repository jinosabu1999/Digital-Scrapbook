"use client"

import { useState, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"
import { Label } from "@/components/ui/label"

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void // Changed from onTagsChange to setTags
  placeholder?: string
  className?: string
}

export function TagInput({ tags, setTags, placeholder = "Add tags...", className }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]) // Changed from onTagsChange to setTags
    }
    setInputValue("")
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove)) // Changed from onTagsChange to setTags
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className={className}>
      <Label className="text-sm font-medium mb-2 block">Tags</Label>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <div className="flex items-center gap-2 flex-1 min-w-[120px]">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? placeholder : ""}
              className="border-0 shadow-none p-0 h-6 focus-visible:ring-0"
            />
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={() => addTag(inputValue)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Press Enter or comma to add tags. Click × to remove.</p>
      </div>
    </div>
  )
}
