export interface MemoryInsight {
  id: string
  type: "pattern" | "suggestion" | "milestone" | "connection"
  title: string
  description: string
  confidence: number
  relatedMemoryIds: string[]
  createdAt: Date
}

export interface AutoTagSuggestion {
  tag: string
  confidence: number
  reason: string
}

export class AIInsightsService {
  static async analyzeMemoryForTags(memory: {
    title: string
    description?: string
    content?: string
    type: string
    location?: string
  }): Promise<AutoTagSuggestion[]> {
    // Simulate AI analysis with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const suggestions: AutoTagSuggestion[] = []

    // Analyze title and description for keywords
    const text = `${memory.title} ${memory.description || ""} ${memory.content || ""}`.toLowerCase()

    // Location-based tags
    if (memory.location) {
      suggestions.push({
        tag: memory.location,
        confidence: 0.9,
        reason: "Detected from location field",
      })
    }

    // Activity detection
    const activities = [
      { keywords: ["vacation", "trip", "travel", "holiday"], tag: "travel", confidence: 0.85 },
      { keywords: ["birthday", "party", "celebration"], tag: "celebration", confidence: 0.9 },
      { keywords: ["work", "office", "meeting", "project"], tag: "work", confidence: 0.8 },
      { keywords: ["family", "mom", "dad", "sister", "brother"], tag: "family", confidence: 0.85 },
      { keywords: ["friend", "friends", "hangout"], tag: "friends", confidence: 0.8 },
      { keywords: ["food", "dinner", "lunch", "restaurant", "cooking"], tag: "food", confidence: 0.8 },
      { keywords: ["exercise", "gym", "running", "workout"], tag: "fitness", confidence: 0.85 },
      { keywords: ["nature", "park", "hiking", "outdoors"], tag: "nature", confidence: 0.8 },
    ]

    activities.forEach((activity) => {
      if (activity.keywords.some((keyword) => text.includes(keyword))) {
        suggestions.push({
          tag: activity.tag,
          confidence: activity.confidence,
          reason: `Detected activity: ${activity.keywords.find((k) => text.includes(k))}`,
        })
      }
    })

    // Emotion detection
    const emotions = [
      { keywords: ["amazing", "wonderful", "great", "awesome", "love"], tag: "happy", confidence: 0.7 },
      { keywords: ["sad", "difficult", "challenging", "miss"], tag: "reflective", confidence: 0.7 },
      { keywords: ["excited", "thrilled", "can't wait"], tag: "excited", confidence: 0.8 },
    ]

    emotions.forEach((emotion) => {
      if (emotion.keywords.some((keyword) => text.includes(keyword))) {
        suggestions.push({
          tag: emotion.tag,
          confidence: emotion.confidence,
          reason: `Detected emotion from text`,
        })
      }
    })

    return suggestions.filter((s) => s.confidence > 0.7)
  }

  static async generateInsights(memories: any[]): Promise<MemoryInsight[]> {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const insights: MemoryInsight[] = []

    if (memories.length === 0) return insights

    // Pattern analysis
    const tagCounts = memories.reduce(
      (acc, memory) => {
        memory.tags?.forEach((tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>,
    )

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    if (topTags.length > 0) {
      insights.push({
        id: "pattern-top-tags",
        type: "pattern",
        title: "Your Most Common Themes",
        description: `You frequently create memories about ${topTags.map(([tag]) => tag).join(", ")}. This shows what matters most to you!`,
        confidence: 0.85,
        relatedMemoryIds: memories
          .filter((m) => m.tags?.includes(topTags[0][0]))
          .map((m) => m.id)
          .slice(0, 3),
        createdAt: new Date(),
      })
    }

    // Mood pattern analysis
    const happyMemories = memories.filter((m) => m.mood === "happy" || m.tags?.includes("happy"))
    if (happyMemories.length > 3) {
      const commonTags = happyMemories.reduce(
        (acc, memory) => {
          memory.tags?.forEach((tag: string) => {
            acc[tag] = (acc[tag] || 0) + 1
          })
          return acc
        },
        {} as Record<string, number>,
      )

      const happyTag = Object.entries(commonTags)
        .filter(([tag]) => tag !== "happy")
        .sort(([, a], [, b]) => b - a)[0]

      if (happyTag) {
        insights.push({
          id: "pattern-happiness",
          type: "pattern",
          title: "What Makes You Happiest",
          description: `You seem to be happiest when creating memories about ${happyTag[0]}. Consider planning more activities around this theme!`,
          confidence: 0.8,
          relatedMemoryIds: happyMemories.map((m) => m.id).slice(0, 3),
          createdAt: new Date(),
        })
      }
    }

    // Milestone detection
    if (memories.length === 10) {
      insights.push({
        id: "milestone-10",
        type: "milestone",
        title: "First 10 Memories! 🎉",
        description:
          "Congratulations on saving your first 10 memories! You're building a beautiful collection of moments.",
        confidence: 1.0,
        relatedMemoryIds: memories.slice(0, 10).map((m) => m.id),
        createdAt: new Date(),
      })
    }

    if (memories.length === 50) {
      insights.push({
        id: "milestone-50",
        type: "milestone",
        title: "50 Memories Strong! ✨",
        description:
          "Amazing! You've captured 50 precious moments. Your digital scrapbook is becoming a treasure trove of memories.",
        confidence: 1.0,
        relatedMemoryIds: memories.slice(0, 5).map((m) => m.id),
        createdAt: new Date(),
      })
    }

    // Time-based suggestions
    const now = new Date()
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const recentMemories = memories.filter((m) => new Date(m.createdAt) > oneMonthAgo)

    if (recentMemories.length === 0 && memories.length > 5) {
      insights.push({
        id: "suggestion-add-memory",
        type: "suggestion",
        title: "Time to Add New Memories",
        description: "You haven't added any memories recently. Why not capture a moment from today?",
        confidence: 0.7,
        relatedMemoryIds: [],
        createdAt: new Date(),
      })
    }

    return insights
  }

  static async findSimilarMemories(memory: any, allMemories: any[]): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const similarMemories = allMemories
      .filter((m) => m.id !== memory.id)
      .map((m) => ({
        id: m.id,
        similarity: this.calculateSimilarity(memory, m),
      }))
      .filter((m) => m.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map((m) => m.id)

    return similarMemories
  }

  private static calculateSimilarity(memory1: any, memory2: any): number {
    let score = 0

    // Tag similarity
    if (memory1.tags && memory2.tags) {
      const commonTags = memory1.tags.filter((tag: string) => memory2.tags.includes(tag))
      score += (commonTags.length / Math.max(memory1.tags.length, memory2.tags.length)) * 0.4
    }

    // Mood similarity
    if (memory1.mood && memory2.mood && memory1.mood === memory2.mood) {
      score += 0.3
    }

    // Location similarity
    if (memory1.location && memory2.location && memory1.location === memory2.location) {
      score += 0.2
    }

    // Date proximity (same month)
    const date1 = new Date(memory1.date)
    const date2 = new Date(memory2.date)
    if (date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()) {
      score += 0.1
    }

    return score
  }
}
