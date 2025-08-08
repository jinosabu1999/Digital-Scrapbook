"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type MoodType = 
  | "happy" 
  | "sad" 
  | "excited" 
  | "calm" 
  | "nostalgic" 
  | "grateful" 
  | "adventurous" 
  | "peaceful" 
  | "energetic" 
  | "reflective" 
  | "love" 
  | "surprised"

interface MoodOption {
  value: MoodType
  label: string
  emoji: string
  color: string
}

const moodOptions: MoodOption[] = [
  { value: "happy", label: "Happy", emoji: "😊", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "sad", label: "Sad", emoji: "😢", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "excited", label: "Excited", emoji: "🤩", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "calm", label: "Calm", emoji: "😌", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "nostalgic", label: "Nostalgic", emoji: "🥺", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "grateful", label: "Grateful", emoji: "🙏", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { value: "adventurous", label: "Adventurous", emoji: "🗺️", color: "bg-teal-100 text-teal-800 border-teal-200" },
  { value: "peaceful", label: "Peaceful", emoji: "☮️", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "energetic", label: "Energetic", emoji: "⚡", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "reflective", label: "Reflective", emoji: "🤔", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { value: "love", label: "Love", emoji: "❤️", color: "bg-rose-100 text-rose-800 border-rose-200" },
  { value: "surprised", label: "Surprised", emoji: "😲", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
]

interface MoodSelectorProps {
  selectedMood?: MoodType
  onMoodChange: (mood: MoodType | undefined) => void
  className?: string
}

export function MoodSelector({ selectedMood, onMoodChange, className }: MoodSelectorProps) {
  const handleMoodSelect = (mood: MoodType) => {
    if (selectedMood === mood) {
      onMoodChange(undefined) // Deselect if already selected
    } else {
      onMoodChange(mood)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Label>Mood (Optional)</Label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {moodOptions.map((mood) => (
          <Button
            key={mood.value}
            type="button"
            variant={selectedMood === mood.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleMoodSelect(mood.value)}
            className={cn(
              "h-auto p-2 flex flex-col items-center gap-1 text-xs",
              selectedMood === mood.value && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <span className="text-lg">{mood.emoji}</span>
            <span className="truncate w-full text-center">{mood.label}</span>
          </Button>
        ))}
      </div>
      {selectedMood && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Selected mood:</span>
          <MoodBadge mood={selectedMood} />
        </div>
      )}
    </div>
  )
}

export function MoodBadge({ mood, className }: { mood: MoodType; className?: string }) {
  const moodOption = moodOptions.find(m => m.value === mood)
  
  if (!moodOption) return null

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "gap-1 text-xs font-medium border",
        moodOption.color,
        className
      )}
    >
      <span>{moodOption.emoji}</span>
      <span>{moodOption.label}</span>
    </Badge>
  )
}

export default MoodSelector
