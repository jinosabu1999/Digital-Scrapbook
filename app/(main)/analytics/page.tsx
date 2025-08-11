"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useMemories } from "@/context/memory-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Tag,
  Heart,
  Camera,
  Video,
  Headphones,
  FileText,
  MapPin,
  Smile,
  Download,
  RefreshCw,
  Target,
  Award,
  Zap,
} from "lucide-react"
import { format, subDays, subMonths, isAfter, isBefore, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns"

interface AnalyticsMetric {
  label: string
  value: number | string
  change?: number
  trend?: "up" | "down" | "neutral"
  icon: React.ReactNode
}

interface ChartData {
  name: string
  value: number
}

export default function AnalyticsPage() {
  const { memories, tags } = useMemories()
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d")
  const [loading, setLoading] = useState(false)

  const filteredMemories = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case "7d":
        startDate = subDays(now, 7)
        break
      case "30d":
        startDate = subDays(now, 30)
        break
      case "90d":
        startDate = subDays(now, 90)
        break
      case "1y":
        startDate = subDays(now, 365)
        break
      default:
        return memories
    }

    return memories.filter((memory) => isAfter(new Date(memory.createdAt), startDate))
  }, [memories, timeRange])

  const metrics: AnalyticsMetric[] = useMemo(() => {
    const totalMemories = filteredMemories.length
    const previousPeriod = memories.filter((memory) => {
      const now = new Date()
      const periodDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365
      const startDate = subDays(now, periodDays * 2)
      const endDate = subDays(now, periodDays)
      return isAfter(new Date(memory.createdAt), startDate) && isBefore(new Date(memory.createdAt), endDate)
    }).length

    const favoriteMemories = filteredMemories.filter((m) => m.isLiked).length
    const uniqueTags = new Set(filteredMemories.flatMap((m) => m.tags || [])).size
    const timeCapsules = filteredMemories.filter((m) => m.isTimeCapsule).length

    const photoCount = filteredMemories.filter((m) => m.type === "photo").length
    const videoCount = filteredMemories.filter((m) => m.type === "video").length
    const audioCount = filteredMemories.filter((m) => m.type === "audio").length
    const textCount = filteredMemories.filter((m) => m.type === "text").length

    const change = previousPeriod > 0 ? ((totalMemories - previousPeriod) / previousPeriod) * 100 : 0

    return [
      {
        label: "Total Memories",
        value: totalMemories,
        change: Math.round(change),
        trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
        icon: <Camera className="h-4 w-4" />,
      },
      {
        label: "Favorite Memories",
        value: favoriteMemories,
        change: undefined,
        icon: <Heart className="h-4 w-4 text-red-500" />,
      },
      {
        label: "Unique Tags",
        value: uniqueTags,
        change: undefined,
        icon: <Tag className="h-4 w-4 text-blue-500" />,
      },
      {
        label: "Time Capsules",
        value: timeCapsules,
        change: undefined,
        icon: <Target className="h-4 w-4 text-purple-500" />,
      },
      {
        label: "Photos",
        value: photoCount,
        change: undefined,
        icon: <Camera className="h-4 w-4 text-green-500" />,
      },
      {
        label: "Videos",
        value: videoCount,
        change: undefined,
        icon: <Video className="h-4 w-4 text-orange-500" />,
      },
      {
        label: "Audio",
        value: audioCount,
        change: undefined,
        icon: <Headphones className="h-4 w-4 text-yellow-500" />,
      },
      {
        label: "Text",
        value: textCount,
        change: undefined,
        icon: <FileText className="h-4 w-4 text-indigo-500" />,
      },
    ]
  }, [filteredMemories, memories, timeRange])

  const memoryTypeData: ChartData[] = useMemo(() => {
    const types = {
      photo: filteredMemories.filter((m) => m.type === "photo").length,
      video: filteredMemories.filter((m) => m.type === "video").length,
      audio: filteredMemories.filter((m) => m.type === "audio").length,
      text: filteredMemories.filter((m) => m.type === "text").length,
    }

    return Object.entries(types)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
  }, [filteredMemories])

  const topTags = useMemo(() => {
    const tagCounts: Record<string, number> = {}
    filteredMemories.forEach((memory) => {
      memory.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))
  }, [filteredMemories])

  const moodDistribution = useMemo(() => {
    const moods: Record<string, number> = {}
    filteredMemories.forEach((memory) => {
      if (memory.mood) {
        moods[memory.mood] = (moods[memory.mood] || 0) + 1
      }
    })

    return Object.entries(moods)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredMemories])

  const monthlyTrend = useMemo(() => {
    if (filteredMemories.length === 0) return []

    const now = new Date()
    const startDate = timeRange === "1y" ? subMonths(now, 12) : subMonths(now, 6)
    const months = eachMonthOfInterval({ start: startDate, end: now })

    return months.map((month) => {
      const monthMemories = memories.filter((memory) => {
        const memoryDate = new Date(memory.createdAt)
        return isAfter(memoryDate, startOfMonth(month)) && isBefore(memoryDate, endOfMonth(month))
      })

      return {
        name: format(month, "MMM yy"),
        value: monthMemories.length,
      }
    })
  }, [memories, timeRange])

  const achievements = useMemo(() => {
    const totalMemories = memories.length
    const achievements = []

    if (totalMemories >= 1)
      achievements.push({ title: "First Memory", description: "Added your first memory", icon: "🎉" })
    if (totalMemories >= 10)
      achievements.push({ title: "Getting Started", description: "Reached 10 memories", icon: "📸" })
    if (totalMemories >= 50)
      achievements.push({ title: "Memory Keeper", description: "Collected 50 memories", icon: "⭐" })
    if (totalMemories >= 100)
      achievements.push({ title: "Memory Master", description: "Amazing! 100 memories strong", icon: "🏆" })
    if (memories.some((m) => m.isLiked))
      achievements.push({ title: "Favorite Picker", description: "Marked your first favorite", icon: "❤️" })
    if (memories.some((m) => m.isTimeCapsule))
      achievements.push({ title: "Time Traveler", description: "Created your first time capsule", icon: "⏰" })
    if (tags.length >= 20) achievements.push({ title: "Tag Master", description: "Used 20+ different tags", icon: "🏷️" })

    return achievements
  }, [memories, tags])

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const exportData = () => {
    const data = {
      metrics,
      memoryTypeData,
      topTags,
      moodDistribution,
      monthlyTrend,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `memory-analytics-${format(new Date(), "yyyy-MM-dd")}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <BarChart3 className="mr-2 h-8 w-8 text-blue-500" />
            Memory Analytics
          </h1>
          <p className="text-muted-foreground">Insights and patterns from your memory collection</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="mr-1 h-3 w-3" />
            Export
          </Button>
        </div>
      </div>

      {memories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data to Analyze</h3>
            <p className="text-muted-foreground text-center">
              Start adding memories to see detailed analytics and insights!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="emotions">Emotions</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      {metric.icon}
                      {metric.change !== undefined && (
                        <div
                          className={`flex items-center text-xs ${
                            metric.trend === "up"
                              ? "text-green-500"
                              : metric.trend === "down"
                                ? "text-red-500"
                                : "text-muted-foreground"
                          }`}
                        >
                          <TrendingUp className={`h-3 w-3 mr-1 ${metric.trend === "down" ? "rotate-180" : ""}`} />
                          {metric.change > 0 ? "+" : ""}
                          {metric.change}%
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="text-xs text-muted-foreground">{metric.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Memory Frequency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average per week:</span>
                      <span className="font-semibold">
                        {timeRange !== "all"
                          ? Math.round(
                              (filteredMemories.length /
                                (timeRange === "7d" ? 1 : timeRange === "30d" ? 4 : timeRange === "90d" ? 12 : 52)) *
                                10,
                            ) / 10
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Most active day:</span>
                      <span className="font-semibold">
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Tag className="mr-2 h-5 w-5" />
                    Top Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topTags.slice(0, 5).map((tag, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                        <span className="text-sm font-semibold">{tag.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      filteredMemories
                        .filter((m) => m.location)
                        .reduce(
                          (acc, m) => {
                            if (m.location) {
                              acc[m.location] = (acc[m.location] || 0) + 1
                            }
                            return acc
                          },
                          {} as Record<string, number>,
                        ),
                    )
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([location, count], index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm truncate">{location}</span>
                          <span className="text-sm font-semibold">{count}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Memory Creation Trend</CardTitle>
                <CardDescription>Track how your memory collection has grown over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyTrend.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-16">{month.name}</span>
                      <div className="flex-1 mx-4">
                        <Progress
                          value={(month.value / Math.max(...monthlyTrend.map((m) => m.value))) * 100}
                          className="h-2"
                        />
                      </div>
                      <span className="text-sm font-semibold w-8 text-right">{month.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {memoryTypeData.map((type, index) => {
                      const percentage = (type.value / filteredMemories.length) * 100
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{type.name}</span>
                            <span>
                              {type.value} ({Math.round(percentage)}%)
                            </span>
                          </div>
                          <Progress value={percentage} />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tag Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topTags.slice(0, 8).map((tag, index) => {
                      const percentage = (tag.count / filteredMemories.length) * 100
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{tag.name}</span>
                            <span>
                              {tag.count} ({Math.round(percentage)}%)
                            </span>
                          </div>
                          <Progress value={percentage} />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Photos:</span>
                      <span className="font-semibold">
                        {memoryTypeData.find((d) => d.name === "Photo")?.value || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Videos:</span>
                      <span className="font-semibold">
                        {memoryTypeData.find((d) => d.name === "Video")?.value || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Audio:</span>
                      <span className="font-semibold">
                        {memoryTypeData.find((d) => d.name === "Audio")?.value || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Text:</span>
                      <span className="font-semibold">{memoryTypeData.find((d) => d.name === "Text")?.value || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Memory Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">With Location:</span>
                      <span className="font-semibold">{filteredMemories.filter((m) => m.location).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">With Tags:</span>
                      <span className="font-semibold">
                        {filteredMemories.filter((m) => m.tags && m.tags.length > 0).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time Capsules:</span>
                      <span className="font-semibold">{filteredMemories.filter((m) => m.isTimeCapsule).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Favorites:</span>
                      <span className="font-semibold">{filteredMemories.filter((m) => m.isLiked).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Tags</CardTitle>
                <CardDescription>Complete list of tags used in your memories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {topTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {tag.name} ({tag.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emotions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smile className="mr-2 h-5 w-5" />
                  Mood Distribution
                </CardTitle>
                <CardDescription>How you've been feeling in your memories</CardDescription>
              </CardHeader>
              <CardContent>
                {moodDistribution.length > 0 ? (
                  <div className="space-y-3">
                    {moodDistribution.map((mood, index) => {
                      const percentage = (mood.count / filteredMemories.length) * 100
                      const moodEmoji =
                        {
                          happy: "😊",
                          sad: "😢",
                          angry: "😠",
                          calm: "😌",
                          excited: "🤩",
                          neutral: "😐",
                        }[mood.mood] || "😐"

                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              <span className="mr-2 text-lg">{moodEmoji}</span>
                              <span className="capitalize">{mood.mood}</span>
                            </span>
                            <span>
                              {mood.count} ({Math.round(percentage)}%)
                            </span>
                          </div>
                          <Progress value={percentage} />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Smile className="mx-auto h-12 w-12 mb-4" />
                    <p>No mood data available</p>
                    <p className="text-sm">Start adding moods to your memories to see emotional patterns!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Emotional Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {moodDistribution.length > 0 && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Most common mood:</p>
                          <p className="font-semibold capitalize">
                            {moodDistribution[0].mood} ({moodDistribution[0].count} memories)
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Emotional variety:</p>
                          <p className="font-semibold">{moodDistribution.length} different moods tracked</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mood Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {moodDistribution.length > 0 ? (
                      <>
                        <p>🌟 You seem to capture mostly {moodDistribution[0].mood} moments!</p>
                        {moodDistribution.filter((m) => ["happy", "excited", "calm"].includes(m.mood)).length > 0 && (
                          <p>✨ Great job focusing on positive memories.</p>
                        )}
                        <p>💡 Try adding more variety to capture the full spectrum of your experiences.</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        Add mood tags to your memories to get personalized insights!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <h3 className="font-semibold mb-1">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Progress Milestones
                </CardTitle>
                <CardDescription>Your journey through the memory collection milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { milestone: 1, label: "First Memory", reached: memories.length >= 1 },
                    { milestone: 10, label: "Getting Started", reached: memories.length >= 10 },
                    { milestone: 25, label: "Regular User", reached: memories.length >= 25 },
                    { milestone: 50, label: "Memory Enthusiast", reached: memories.length >= 50 },
                    { milestone: 100, label: "Memory Master", reached: memories.length >= 100 },
                    { milestone: 250, label: "Memory Legend", reached: memories.length >= 250 },
                    { milestone: 500, label: "Memory Virtuoso", reached: memories.length >= 500 },
                  ].map((milestone, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${milestone.reached ? "bg-green-500" : "bg-gray-300"}`} />
                        <div>
                          <p className="font-medium">{milestone.label}</p>
                          <p className="text-sm text-muted-foreground">{milestone.milestone} memories</p>
                        </div>
                      </div>
                      {milestone.reached && <Badge variant="secondary">✓ Achieved</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
