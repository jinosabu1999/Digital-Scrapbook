"use client"

import { useState } from "react"
import { useMemories } from "@/context/memory-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Heart,
  ImageIcon,
  MapPin,
  Tag,
  TrendingUp,
  Clock,
  Target,
  Award,
  Zap,
  Camera,
  Video,
  Mic,
  FileText,
} from "lucide-react"
import { format, subDays } from "date-fns"

export default function StatsPage() {
  const { memories, loading } = useMemories()
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")

  // Calculate statistics
  const totalMemories = memories.length
  const favoriteMemories = memories.filter((m) => m.isLiked).length
  const timeCapsules = memories.filter((m) => m.isTimeCapsule).length
  const publicMemories = memories.filter((m) => m.isPublic).length

  // Memory types breakdown
  const memoryTypes = {
    photo: memories.filter((m) => m.type === "photo").length,
    video: memories.filter((m) => m.type === "video").length,
    audio: memories.filter((m) => m.type === "audio").length,
    text: memories.filter((m) => m.type === "text").length,
  }

  // Most used tags
  const tagCounts = memories.reduce(
    (acc, memory) => {
      memory.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  // Most used locations
  const locationCounts = memories.reduce(
    (acc, memory) => {
      if (memory.location) {
        acc[memory.location] = (acc[memory.location] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const topLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Memory creation trends
  const getDateRange = () => {
    const now = new Date()
    switch (timeRange) {
      case "week":
        return { start: subDays(now, 7), end: now }
      case "month":
        return { start: subDays(now, 30), end: now }
      case "year":
        return { start: subDays(now, 365), end: now }
      default:
        return { start: subDays(now, 30), end: now }
    }
  }

  const { start, end } = getDateRange()
  const recentMemories = memories.filter((m) => {
    const memoryDate = new Date(m.createdAt)
    return memoryDate >= start && memoryDate <= end
  })

  // Memory streaks
  const getMemoryStreak = () => {
    const sortedMemories = memories.map((m) => new Date(m.createdAt)).sort((a, b) => b.getTime() - a.getTime())

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1
    let lastDate = sortedMemories[0]

    for (let i = 1; i < sortedMemories.length; i++) {
      const currentDate = sortedMemories[i]
      const daysDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        tempStreak++
      } else if (daysDiff > 1) {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }

      lastDate = currentDate
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    // Calculate current streak
    const today = new Date()
    const yesterday = subDays(today, 1)
    const hasMemoryToday = memories.some((m) => {
      const memoryDate = new Date(m.createdAt)
      return memoryDate.toDateString() === today.toDateString()
    })
    const hasMemoryYesterday = memories.some((m) => {
      const memoryDate = new Date(m.createdAt)
      return memoryDate.toDateString() === yesterday.toDateString()
    })

    if (hasMemoryToday || hasMemoryYesterday) {
      currentStreak = 1
      let checkDate = hasMemoryToday ? yesterday : subDays(yesterday, 1)

      while (memories.some((m) => new Date(m.createdAt).toDateString() === checkDate.toDateString())) {
        currentStreak++
        checkDate = subDays(checkDate, 1)
      }
    }

    return { current: currentStreak, longest: longestStreak }
  }

  const streaks = getMemoryStreak()

  // Mood analysis (if mood data exists)
  const moodCounts = memories.reduce(
    (acc, memory) => {
      if (memory.mood) {
        acc[memory.mood] = (acc[memory.mood] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const topMoods = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Memory Statistics</h1>
          <p className="text-muted-foreground mt-1">Insights into your digital scrapbook</p>
        </div>
        <div className="flex gap-2">
          <Button variant={timeRange === "week" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("week")}>
            Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            Month
          </Button>
          <Button variant={timeRange === "year" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("year")}>
            Year
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMemories}</div>
            <p className="text-xs text-muted-foreground">
              {recentMemories.length} in the last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteMemories}</div>
            <p className="text-xs text-muted-foreground">
              {((favoriteMemories / totalMemories) * 100).toFixed(1)}% of all memories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streaks.current}</div>
            <p className="text-xs text-muted-foreground">Longest: {streaks.longest} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Capsules</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeCapsules}</div>
            <p className="text-xs text-muted-foreground">Memories for the future</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Memory Types
                </CardTitle>
                <CardDescription>Distribution of your content types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      <span>Photos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(memoryTypes.photo / totalMemories) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{memoryTypes.photo}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span>Videos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(memoryTypes.video / totalMemories) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{memoryTypes.video}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      <span>Audio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{ width: `${(memoryTypes.audio / totalMemories) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{memoryTypes.audio}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Text</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${(memoryTypes.text / totalMemories) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{memoryTypes.text}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Popular Tags
                </CardTitle>
                <CardDescription>Your most frequently used tags</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {topTags.map(([tag, count]) => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag} ({count})
                    </Badge>
                  ))}
                  {topTags.length === 0 && <p className="text-sm text-muted-foreground">No tags used yet</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Locations
                </CardTitle>
                <CardDescription>Places where you create the most memories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topLocations.map(([location, count], index) => (
                  <div key={location} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="truncate">{location}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
                {topLocations.length === 0 && (
                  <p className="text-sm text-muted-foreground">No locations recorded yet</p>
                )}
              </CardContent>
            </Card>

            {topMoods.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Mood Trends
                  </CardTitle>
                  <CardDescription>Your emotional journey through memories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topMoods.map(([mood, count]) => (
                    <div key={mood} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{mood}</span>
                        <span className="capitalize">{mood}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Memory Activity
                </CardTitle>
                <CardDescription>Your memory creation patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Daily Average</span>
                    <span className="font-medium">
                      {(
                        totalMemories /
                        Math.max(
                          1,
                          Math.floor(
                            (Date.now() - new Date(memories[memories.length - 1]?.createdAt || Date.now()).getTime()) /
                              (1000 * 60 * 60 * 24),
                          ),
                        )
                      ).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Most Active Day</span>
                    <span className="font-medium">
                      {(memories.reduce(
                        (acc, memory) => {
                          const day = format(new Date(memory.createdAt), "EEEE")
                          acc[day] = (acc[day] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ) &&
                        Object.entries(
                          memories.reduce(
                            (acc, memory) => {
                              const day = format(new Date(memory.createdAt), "EEEE")
                              acc[day] = (acc[day] || 0) + 1
                              return acc
                            },
                            {} as Record<string, number>,
                          ),
                        ).sort(([, a], [, b]) => b - a)[0]?.[0]) ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Favorite Time</span>
                    <span className="font-medium">
                      {(memories.reduce(
                        (acc, memory) => {
                          const hour = new Date(memory.createdAt).getHours()
                          const timeOfDay = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening"
                          acc[timeOfDay] = (acc[timeOfDay] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ) &&
                        Object.entries(
                          memories.reduce(
                            (acc, memory) => {
                              const hour = new Date(memory.createdAt).getHours()
                              const timeOfDay = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening"
                              acc[timeOfDay] = (acc[timeOfDay] || 0) + 1
                              return acc
                            },
                            {} as Record<string, number>,
                          ),
                        ).sort(([, a], [, b]) => b - a)[0]?.[0]) ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
                <CardDescription>Your memory milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${totalMemories >= 10 ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}
                  >
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">First 10 Memories</p>
                    <p className="text-xs text-muted-foreground">
                      {totalMemories >= 10 ? "Completed!" : `${totalMemories}/10`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${streaks.longest >= 7 ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}
                  >
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Week Streak</p>
                    <p className="text-xs text-muted-foreground">
                      {streaks.longest >= 7 ? "Completed!" : `${streaks.longest}/7 days`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${favoriteMemories >= 5 ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}
                  >
                    <Heart className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Memory Curator</p>
                    <p className="text-xs text-muted-foreground">
                      {favoriteMemories >= 5 ? "Completed!" : `${favoriteMemories}/5 favorites`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${Object.keys(tagCounts).length >= 10 ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}
                  >
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Tag Master</p>
                    <p className="text-xs text-muted-foreground">
                      {Object.keys(tagCounts).length >= 10
                        ? "Completed!"
                        : `${Object.keys(tagCounts).length}/10 unique tags`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Personal Insights
                </CardTitle>
                <CardDescription>Discover patterns in your memory creation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Memory Diversity</h4>
                    <p className="text-sm text-muted-foreground">
                      You've created {Object.values(memoryTypes).filter((count) => count > 0).length} different types of
                      memories.
                      {memoryTypes.photo > totalMemories * 0.7 && " You love capturing photos!"}
                      {memoryTypes.text > totalMemories * 0.3 && " You're great at documenting thoughts!"}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Consistency</h4>
                    <p className="text-sm text-muted-foreground">
                      Your longest streak is {streaks.longest} days.
                      {streaks.longest >= 7 && " You're building a great habit!"}
                      {streaks.longest < 3 && " Try to create memories more regularly!"}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Organization</h4>
                    <p className="text-sm text-muted-foreground">
                      You use an average of{" "}
                      {(memories.reduce((sum, m) => sum + m.tags.length, 0) / Math.max(1, totalMemories)).toFixed(1)}{" "}
                      tags per memory.
                      {memories.reduce((sum, m) => sum + m.tags.length, 0) / Math.max(1, totalMemories) >= 3 &&
                        " Great organization skills!"}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Exploration</h4>
                    <p className="text-sm text-muted-foreground">
                      You've recorded memories in {Object.keys(locationCounts).length} different locations.
                      {Object.keys(locationCounts).length >= 5 && " You're quite the explorer!"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
