"use client"

import { useState } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Clock, TrendingUp, Tag, Heart, ImageIcon, Video, Music, FileText } from "lucide-react"
import { FavoriteButton } from "@/components/favorite-button"
import { MoodBadge } from "@/components/mood-selector"
import Link from "next/link"
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from "date-fns"

type FilterType = "all" | "today" | "week" | "month" | "year"
type SortType = "newest" | "oldest"

export default function TimelinePage() {
  const { memories, tags, loading } = useMemories()
  const [filter, setFilter] = useState<FilterType>("all")
  const [sort, setSort] = useState<SortType>("newest")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading timeline...</p>
        </div>
      </div>
    )
  }

  const filteredMemories =
    memories
      ?.filter((memory) => {
        if (!memory) return false

        const memoryDate = new Date(memory.date)

        switch (filter) {
          case "today":
            return isToday(memoryDate)
          case "week":
            return isThisWeek(memoryDate)
          case "month":
            return isThisMonth(memoryDate)
          case "year":
            return isThisYear(memoryDate)
          default:
            return true
        }
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return sort === "newest" ? dateB - dateA : dateA - dateB
      }) || []

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Music className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getRelativeDate = (date: Date) => {
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    if (isThisWeek(date)) return format(date, "EEEE")
    if (isThisMonth(date)) return format(date, "MMM d")
    if (isThisYear(date)) return format(date, "MMM d")
    return format(date, "MMM d, yyyy")
  }

  const stats = {
    total: memories?.length || 0,
    favorites: memories?.filter((m) => m.isLiked).length || 0,
    thisWeek: memories?.filter((m) => isThisWeek(new Date(m.date))).length || 0,
    types: {
      photo: memories?.filter((m) => m.type === "photo").length || 0,
      video: memories?.filter((m) => m.type === "video").length || 0,
      audio: memories?.filter((m) => m.type === "audio").length || 0,
      text: memories?.filter((m) => m.type === "text").length || 0,
    },
  }

  const popularTags = tags?.slice(0, 5) || []

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Timeline & Analytics</h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                  <p className="text-2xl font-bold">{stats.favorites}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{stats.thisWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Photos</p>
                  <p className="text-2xl font-bold">{stats.types.photo}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-sm">Photos</span>
                  </div>
                  <Badge variant="outline">{stats.types.photo}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span className="text-sm">Videos</span>
                  </div>
                  <Badge variant="outline">{stats.types.video}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    <span className="text-sm">Audio</span>
                  </div>
                  <Badge variant="outline">{stats.types.audio}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Text</span>
                  </div>
                  <Badge variant="outline">{stats.types.text}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              {popularTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tags yet</p>
              ) : (
                <div className="space-y-3">
                  {popularTags.map((tag) => (
                    <div key={tag.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span className="text-sm">{tag.name}</span>
                      </div>
                      <Badge variant="outline">{tag.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(value: SortType) => setSort(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold mb-2">No memories found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filter criteria or add some memories!</p>
          <Link href="/upload">
            <Button>Add Your First Memory</Button>
          </Link>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

          <div className="space-y-8">
            {filteredMemories.map((memory, index) => (
              <div key={memory.id} className="relative flex items-start space-x-4">
                {/* Timeline Dot */}
                <div className="relative z-10 flex items-center justify-center w-4 h-4 bg-primary rounded-full border-2 border-background">
                  <div className="w-2 h-2 bg-background rounded-full"></div>
                </div>

                {/* Memory Card */}
                <Card className="flex-1 group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(memory.type)}
                          <h3 className="font-semibold text-lg">{memory.title || "Untitled Memory"}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{getRelativeDate(new Date(memory.date))}</span>
                          {memory.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {memory.location}
                            </div>
                          )}
                          {memory.isTimeCapsule && (
                            <div className="flex items-center gap-1 text-amber-600">
                              <Clock className="h-3 w-3" />
                              Time Capsule
                            </div>
                          )}
                        </div>
                      </div>
                      <FavoriteButton memoryId={memory.id} isLiked={memory.isLiked} />
                    </div>

                    {memory.mediaUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        {memory.type === "photo" && (
                          <img
                            src={memory.mediaUrl || "/placeholder.svg"}
                            alt={memory.title || "Memory"}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        {memory.type === "video" && (
                          <video src={memory.mediaUrl} className="w-full h-48 object-cover" controls />
                        )}
                        {memory.type === "audio" && (
                          <div className="bg-muted p-4 rounded-lg">
                            <audio src={memory.mediaUrl} controls className="w-full" />
                          </div>
                        )}
                      </div>
                    )}

                    {memory.description && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{memory.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {memory.mood && <MoodBadge mood={memory.mood} />}
                        {memory.tags && memory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {memory.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {memory.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{memory.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <Link href={`/memory/${memory.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
