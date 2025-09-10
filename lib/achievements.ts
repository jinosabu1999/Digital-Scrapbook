import type { Achievement, AchievementRarity, Memory, UserStats } from "@/types"

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "progress" | "isUnlocked" | "unlockedAt">[] = [
  // Memory Milestones
  {
    id: "first_memory",
    title: "First Steps",
    description: "Create your very first memory",
    icon: "🌟",
    category: "memories",
    requirement: 1,
    rarity: "common",
  },
  {
    id: "memory_collector_10",
    title: "Memory Collector",
    description: "Create 10 memories",
    icon: "📚",
    category: "memories",
    requirement: 10,
    rarity: "common",
  },
  {
    id: "memory_enthusiast_50",
    title: "Memory Enthusiast",
    description: "Create 50 memories",
    icon: "🎯",
    category: "memories",
    requirement: 50,
    rarity: "rare",
  },
  {
    id: "memory_master_100",
    title: "Memory Master",
    description: "Create 100 memories",
    icon: "👑",
    category: "memories",
    requirement: 100,
    rarity: "epic",
  },
  {
    id: "memory_legend_500",
    title: "Memory Legend",
    description: "Create 500 memories",
    icon: "🏆",
    category: "memories",
    requirement: 500,
    rarity: "legendary",
  },

  // Streak Achievements
  {
    id: "streak_3",
    title: "Getting Started",
    description: "Create memories for 3 days in a row",
    icon: "🔥",
    category: "streaks",
    requirement: 3,
    rarity: "common",
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Create memories for 7 days in a row",
    icon: "⚡",
    category: "streaks",
    requirement: 7,
    rarity: "rare",
  },
  {
    id: "streak_30",
    title: "Monthly Master",
    description: "Create memories for 30 days in a row",
    icon: "💎",
    category: "streaks",
    requirement: 30,
    rarity: "epic",
  },
  {
    id: "streak_100",
    title: "Centurion",
    description: "Create memories for 100 days in a row",
    icon: "🌟",
    category: "streaks",
    requirement: 100,
    rarity: "legendary",
  },

  // Social Achievements
  {
    id: "first_favorite",
    title: "Heart Warmer",
    description: "Mark your first memory as favorite",
    icon: "❤️",
    category: "social",
    requirement: 1,
    rarity: "common",
  },
  {
    id: "favorite_collector_10",
    title: "Favorite Collector",
    description: "Have 10 favorite memories",
    icon: "💕",
    category: "social",
    requirement: 10,
    rarity: "rare",
  },
  {
    id: "favorite_enthusiast_25",
    title: "Love Enthusiast",
    description: "Have 25 favorite memories",
    icon: "💖",
    category: "social",
    requirement: 25,
    rarity: "epic",
  },

  // Creative Achievements
  {
    id: "first_collage",
    title: "Creative Spark",
    description: "Create your first collage",
    icon: "🎨",
    category: "creative",
    requirement: 1,
    rarity: "common",
  },
  {
    id: "photo_editor",
    title: "Photo Artist",
    description: "Apply effects to 5 photos",
    icon: "🖼️",
    category: "creative",
    requirement: 5,
    rarity: "rare",
  },
  {
    id: "collage_master",
    title: "Collage Master",
    description: "Create 10 collages",
    icon: "🖌️",
    category: "creative",
    requirement: 10,
    rarity: "epic",
  },

  // Explorer Achievements
  {
    id: "first_location",
    title: "First Journey",
    description: "Add location to your first memory",
    icon: "📍",
    category: "explorer",
    requirement: 1,
    rarity: "common",
  },
  {
    id: "location_explorer_5",
    title: "Local Explorer",
    description: "Visit 5 different locations",
    icon: "🗺️",
    category: "explorer",
    requirement: 5,
    rarity: "rare",
  },
  {
    id: "world_traveler_20",
    title: "World Traveler",
    description: "Visit 20 different locations",
    icon: "🌍",
    category: "explorer",
    requirement: 20,
    rarity: "epic",
  },

  // Collector Achievements
  {
    id: "tag_starter",
    title: "Tag Starter",
    description: "Use 5 different tags",
    icon: "🏷️",
    category: "collector",
    requirement: 5,
    rarity: "common",
  },
  {
    id: "tag_collector_20",
    title: "Tag Collector",
    description: "Use 20 different tags",
    icon: "📋",
    category: "collector",
    requirement: 20,
    rarity: "rare",
  },
  {
    id: "tag_master_50",
    title: "Tag Master",
    description: "Use 50 different tags",
    icon: "📊",
    category: "collector",
    requirement: 50,
    rarity: "epic",
  },
]

export function calculateUserStats(memories: Memory[]): UserStats {
  const totalMemories = memories.length
  const favoriteMemories = memories.filter((m) => m.isLiked).length

  // Calculate unique locations
  const uniqueLocations = new Set(memories.filter((m) => m.location).map((m) => m.location!.toLowerCase())).size

  // Calculate unique tags
  const uniqueTags = new Set(memories.flatMap((m) => m.tags.map((tag) => tag.toLowerCase()))).size

  // Calculate photos with effects
  const photosWithEffects = memories.filter((m) => m.appliedFilter).length

  // Calculate current and longest streak
  const sortedMemories = [...memories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let lastDate: Date | null = null

  // Group memories by date
  const memoryDates = new Set(sortedMemories.map((m) => new Date(m.createdAt).toDateString()))

  const sortedDates = Array.from(memoryDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  // Calculate current streak
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

  if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
    let checkDate = new Date()
    if (!sortedDates.includes(today)) {
      checkDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    }

    while (sortedDates.includes(checkDate.toDateString())) {
      currentStreak++
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000)
    }
  }

  // Calculate longest streak
  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])

    if (lastDate === null) {
      tempStreak = 1
    } else {
      const dayDiff = Math.abs(lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      if (dayDiff === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }

    lastDate = currentDate
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return {
    totalMemories,
    favoriteMemories,
    currentStreak,
    longestStreak,
    uniqueLocations,
    uniqueTags,
    photosWithEffects,
    collagesCreated: 0, // This would need to be tracked separately
    lastMemoryDate: sortedMemories[0]?.createdAt,
  }
}

export function updateAchievements(
  currentAchievements: Achievement[],
  stats: UserStats,
): { achievements: Achievement[]; newlyUnlocked: Achievement[] } {
  const newlyUnlocked: Achievement[] = []

  const updatedAchievements = ACHIEVEMENT_DEFINITIONS.map((def) => {
    const existing = currentAchievements.find((a) => a.id === def.id)

    let progress = 0
    let isUnlocked = existing?.isUnlocked || false
    let unlockedAt = existing?.unlockedAt

    // Calculate progress based on achievement type
    switch (def.id) {
      // Memory achievements
      case "first_memory":
      case "memory_collector_10":
      case "memory_enthusiast_50":
      case "memory_master_100":
      case "memory_legend_500":
        progress = stats.totalMemories
        break

      // Streak achievements
      case "streak_3":
      case "streak_7":
      case "streak_30":
      case "streak_100":
        progress = Math.max(stats.currentStreak, stats.longestStreak)
        break

      // Social achievements
      case "first_favorite":
      case "favorite_collector_10":
      case "favorite_enthusiast_25":
        progress = stats.favoriteMemories
        break

      // Creative achievements
      case "photo_editor":
        progress = stats.photosWithEffects
        break
      case "first_collage":
      case "collage_master":
        progress = stats.collagesCreated
        break

      // Explorer achievements
      case "first_location":
      case "location_explorer_5":
      case "world_traveler_20":
        progress = stats.uniqueLocations
        break

      // Collector achievements
      case "tag_starter":
      case "tag_collector_20":
      case "tag_master_50":
        progress = stats.uniqueTags
        break
    }

    // Check if achievement should be unlocked
    if (!isUnlocked && progress >= def.requirement) {
      isUnlocked = true
      unlockedAt = new Date()
      newlyUnlocked.push({
        ...def,
        progress,
        isUnlocked,
        unlockedAt,
      })
    }

    return {
      ...def,
      progress,
      isUnlocked,
      unlockedAt,
    }
  })

  return {
    achievements: updatedAchievements,
    newlyUnlocked,
  }
}

export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case "common":
      return "text-gray-600 dark:text-gray-400"
    case "rare":
      return "text-blue-600 dark:text-blue-400"
    case "epic":
      return "text-purple-600 dark:text-purple-400"
    case "legendary":
      return "text-yellow-600 dark:text-yellow-400"
  }
}

export function getRarityBadgeColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case "common":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    case "rare":
      return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
    case "epic":
      return "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
    case "legendary":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
  }
}
