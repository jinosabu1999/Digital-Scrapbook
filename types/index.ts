export type MemoryType = "photo" | "video" | "audio" | "text"
export type MoodType = "happy" | "sad" | "angry" | "calm" | "excited" | "neutral"

export interface Memory {
  id: string
  title: string
  description?: string
  date: Date
  location?: string
  tags: string[]
  type: MemoryType
  content?: string // For text memories
  mediaUrl?: string // Base64 string for uploaded media
  isTimeCapsule: boolean
  unlockDate?: Date
  mood?: MoodType
  isLiked: boolean
  createdAt: Date
  updatedAt: Date
  appliedFilter?: string
}

export interface Tag {
  id: string
  name: string
  count: number
}
