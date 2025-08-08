"use client"

import type React from "react"

import { useState, type KeyboardEvent, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export function TagInput({ tags, setTags, placeholder = "Add tag...", className }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag !== "" && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
    }
    setInputValue("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      // Remove the last tag when backspace is pressed and input is empty
      setTags(tags.slice(0, -1))
    } else if (e.key === "," && inputValue.trim() !== "") {
      // Allow adding tags with comma
      e.preventDefault()
      addTag(inputValue)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Focus the input when clicking on the container
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle paste events to add multiple tags at once
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const pastedTags = pastedText
      .split(/[,\n\r]/)
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "")

    const newTags = [...tags]
    pastedTags.forEach((tag) => {
      if (!newTags.includes(tag)) {
        newTags.push(tag)
      }
    })

    setTags(newTags)
    setInputValue("")
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-wrap gap-2 p-2 border rounded-md min-h-10 focus-within:ring-1 focus-within:ring-ring focus-within:border-input",
        className,
      )}
      onClick={handleContainerClick}
    >
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-sm py-1 px-2">
          {tag}
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(tag)
            }}
          />
        </Badge>
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-7"
      />
    </div>
  )
}
