"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Smile, Frown, Angry, Meh, Laugh, Zap } from 'lucide-react'
import type { MoodType } from "@/types"

interface MoodSelectorProps {
  selectedMood?: MoodType
  onMoodChange: (mood: MoodType | undefined) => void
}

interface MoodBadgeProps {
  mood: MoodType
  className?: string
}

const moods: { type: MoodType; icon: React.ElementType; label: string }[] = [
  { type: "happy", icon: Smile, label: "Happy" },
  { type: "sad", icon: Frown, label: "Sad" },
  { type: "angry", icon: Angry, label: "Angry" },
  { type: "calm", icon: Meh, label: "Calm" },
  { type: "excited", icon: Zap, label: "Excited" },
  { type: "neutral", icon: Smile, label: "Neutral" }, // Using Smile for neutral as well, or pick another
]

export function MoodSelector({ selectedMood, onMoodChange }: MoodSelectorProps) {
  const [open, setOpen] = useState(false)

  const handleMoodSelect = (mood: MoodType) => {
    onMoodChange(mood === selectedMood ? undefined : mood) // Toggle off if same mood selected
    setOpen(false)
  }

  const CurrentMoodIcon = selectedMood ? moods.find(m => m.type === selectedMood)?.icon : Smile

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedMood && "text-muted-foreground"
          )}
        >
          {CurrentMoodIcon && <CurrentMoodIcon className="mr-2 h-4 w-4" />}
          {selectedMood ? moods.find(m => m.type === selectedMood)?.label : "Select Mood"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 grid grid-cols-3 gap-2">
        {moods.map((mood) => (
          <Button
            key={mood.type}
            variant={selectedMood === mood.type ? "default" : "ghost"}
            onClick={() => handleMoodSelect(mood.type)}
            className="flex flex-col h-auto py-3"
          >
            <mood.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{mood.label}</span>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

export function MoodBadge({ mood, className }: MoodBadgeProps) {
  const moodInfo = moods.find(m => m.type === mood)
  if (!moodInfo) return null

  const Icon = moodInfo.icon

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      mood === "happy" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      mood === "sad" && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      mood === "angry" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      mood === "calm" && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      mood === "excited" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      mood === "neutral" && "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      className
    )}>
      <Icon className="h-3 w-3 mr-1" />
      {moodInfo.label}
    </span>
  )
}
