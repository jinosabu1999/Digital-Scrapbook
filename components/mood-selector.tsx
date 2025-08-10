"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { MoodType } from "@/types"

const moods: { value: MoodType; label: string; emoji: string }[] = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "sad", label: "Sad", emoji: "😢" },
  { value: "excited", label: "Excited", emoji: "🤩" },
  { value: "calm", label: "Calm", emoji: "😌" },
  { value: "angry", label: "Angry", emoji: "😠" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
]

interface MoodSelectorProps {
  selectedMood?: MoodType
  onMoodChange?: (mood: MoodType | undefined) => void
}

export function MoodSelector({ selectedMood, onMoodChange }: MoodSelectorProps) {
  const handleMoodSelect = (mood: MoodType) => {
    if (onMoodChange) {
      onMoodChange(selectedMood === mood ? undefined : mood)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Mood</label>
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <Button
            key={mood.value}
            variant={selectedMood === mood.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleMoodSelect(mood.value)}
            className="h-8"
          >
            <span className="mr-1">{mood.emoji}</span>
            {mood.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

interface MoodBadgeProps {
  mood: MoodType
  className?: string
}

export function MoodBadge({ mood, className }: MoodBadgeProps) {
  const moodData = moods.find((m) => m.value === mood)

  if (!moodData) return null

  return (
    <Badge variant="secondary" className={className}>
      <span className="mr-1">{moodData.emoji}</span>
      {moodData.label}
    </Badge>
  )
}
