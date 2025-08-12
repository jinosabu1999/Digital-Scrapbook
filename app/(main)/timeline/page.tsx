"use client"

import { useState, useMemo } from "react"
import { useMemories } from "@/context/memory-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/empty-state"
import { MoodBadge } from "@/components/mood-selector"
import { Calendar, Clock, Image, Video, FileText, Mic, Heart, Tag, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react'
import Link from "next/link"
import { format, isToday, isThisWeek, isThisMonth, isThisYear, startOfDay, differenceInDays } from "date-fns"
import type { Memory } from "@/types"

export default function TimelinePage() {
  const { memories = [], toggleFavorite } = useMemories()
  const [timeFilter, setTimeFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("newest")

  // Safe array operations with null checks
  const safeMemories = Array.isArray(memories) ? memories : []

  const filteredMemories = useMemo(() => {
    return safeMemories.filter((memory: Memory) => {
      if (!memory?.createdAt) return false
      
      const memoryDate = new Date(memory.createdAt)
      
      switch (timeFilter) {
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
  }, [safeMemories, timeFilter])

  const sortedMemories = useMemo(() => {
    return [...filteredMemories].sort((a: Memory, b: Memory) => {
      if (!a.createdAt || !b.createdAt) return 0
      
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })
  }, [filteredMemories, sortOrder])

  // Group memories by date
  const groupedMemories = useMemo(() => {
    const groups: { [key: string]: Memory[] } = {}
    
    sortedMemories.forEach((memory: Memory) => {
      if (!memory.createdAt) return
      
      const dateKey = format(new Date(memory.createdAt), "yyyy-MM-dd")
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(memory)
    })
    
    return groups
  }, [sortedMemories])

  // Analytics data
  const analytics = useMemo(() => {
    const total = safeMemories.length
    const favorites = safeMemories.filter(m => m.isFavorite).length
    const thisWeek = safeMemories.filter(m => m.createdAt && isThisWeek(new Date(m.createdAt))).length
    
    const typeBreakdown = safeMemories.reduce((acc, memory) => {
      acc[memory.type] = (acc[memory.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const tagCounts = safeMemories.reduce((acc, memory) => {
      memory.tags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    return {
      total,
      favorites,
      thisWeek,
      typeBreakdown,
      topTags
    }
  }, [safeMemories])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Image className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Mic className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getRelativeTimeLabel = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const daysDiff = differenceInDays(startOfDay(today), startOfDay(date))
    
    if (daysDiff === 0) return "Today"
    if (daysDiff === 1) return "Yesterday"
    if (daysDiff < 7) return `${daysDiff} days ago`
    
    return format(date, "MMMM d, yyyy")
  }

  if (safeMemories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Timeline</h1>
          <Link href="/upload">
            <Button>Add Memory</Button>
          </Link>
        </div>
        <EmptyState
          title="No memories in your timeline"
          description="Start capturing your journey by adding your first memory."
          actionLabel="Add Memory"
          actionHref="/upload"
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Timeline</h1>
        <Link href="/upload">
          <Button>Add Memory</Button>
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{analytics.total}</p>
                <p className="text-xs text-muted-foreground">Total Memories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{analytics.favorites}</p>
                <p className="text-xs text-muted-foreground">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{analytics.thisWeek}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(analytics.typeBreakdown).length}</p>
                <p className="text-xs text-muted-foreground">Content Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Tags */}
      {analytics.topTags.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.topTags.map(([tag, count]) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Clock className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {sortedMemories.length} memories
        </p>
      </div>

      {/* Timeline */}
      {Object.keys(groupedMemories).length === 0 ? (
        <EmptyState
          title="No memories found"
          description="Try adjusting your time filter to see more memories."
          actionLabel="Show All"
          onAction={() => setTimeFilter("all")}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMemories).map(([dateKey, dayMemories]) => (
            <div key={dateKey} className="relative">
              {/* Date Header */}
              <div className="sticky top-4 z-10 mb-4">
                <div className="inline-flex items-center gap-2 bg-background px-3 py-1 rounded-full border shadow-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {getRelativeTimeLabel(dateKey)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {dayMemories.length} {dayMemories.length === 1 ? 'memory' : 'memories'}
                  </Badge>
                </div>
              </div>

              {/* Timeline Line */}
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />

              {/* Memories for this date */}
              <div className="space-y-6">
                {dayMemories.map((memory: Memory, index: number) => (
                  <div key={memory.id} className="relative flex gap-4">
                    {/* Timeline Dot */}
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      <div className="w-3 h-3 bg-primary rounded-full border-2 border-background shadow-sm" />
                    </div>

                    {/* Memory Card */}
                    <Card className="flex-1 group hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(memory.type)}
                            <CardTitle className="text-lg line-clamp-1">
                              {memory.title || "Untitled Memory"}
                            </CardTitle>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(memory.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Heart 
                              className={`h-4 w-4 ${
                                memory.isFavorite 
                                  ? "fill-red-500 text-red-500" 
                                  : "text-muted-foreground"
                              }`} 
                            />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {memory.fileUrl && memory.type === "photo" && (
                          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                            <img
                              src={memory.fileUrl || "/placeholder.svg"}
                              alt={memory.title || "Memory"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {memory.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {memory.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {memory.mood && <MoodBadge mood={memory.mood} />}
                          
                          {memory.tags && memory.tags.length > 0 && (
                            <>
                              {memory.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {memory.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{memory.tags.length - 3} more
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <span>
                            {memory.createdAt && format(new Date(memory.createdAt), "h:mm a")}
                          </span>
                          <Link 
                            href={`/memory/${memory.id}`}
                            className="text-primary hover:underline"
                          >
                            View Details
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
