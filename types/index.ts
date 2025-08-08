export type MemoryType = "photo" | "video" | "audio" | "text"
export type MoodType = "happy" | "sad" | "excited" | "calm" | "nostalgic" | "grateful"

export interface Memory {
  id: string
  title: string
  description?: string
  date: Date
  location?: string
  tags?: string[]
  type: MemoryType
  content?: string
  mediaUrl?: string
  isTimeCapsule: boolean
  unlockDate?: Date
  createdAt: Date
  updatedAt: Date
  isLiked?: boolean
  appliedFilter?: string
  mood?: MoodType
}

export interface Album {
  id: string
  title: string
  description?: string
  coverUrl?: string
  memories: string[] // Memory IDs
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  name: string
  count: number
}
