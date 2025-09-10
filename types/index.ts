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
  isLiked: boolean // Renamed from isFavorite for consistency with toggleLike
  createdAt: Date
  updatedAt: Date
  appliedFilter?: string // For image filters, if implemented
}

export interface Tag {
  id: string
  name: string
  count: number
}

export interface Collage {
  id: string
  title: string
  description?: string
  memoryIds: string[]
  layout: CollageLayout
  createdAt: Date
  updatedAt: Date
}

export type CollageLayout = "grid" | "mosaic" | "circular" | "diagonal" | "heart"

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: AchievementCategory
  requirement: number
  unlockedAt?: Date
  progress: number
  isUnlocked: boolean
  rarity: AchievementRarity
}

export type AchievementCategory = "memories" | "streaks" | "social" | "creative" | "explorer" | "collector"
export type AchievementRarity = "common" | "rare" | "epic" | "legendary"

export interface UserStats {
  totalMemories: number
  favoriteMemories: number
  currentStreak: number
  longestStreak: number
  uniqueLocations: number
  uniqueTags: number
  photosWithEffects: number
  collagesCreated: number
  lastMemoryDate?: Date
}
