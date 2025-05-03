"use client"

import { useState, useMemo } from "react"
import { useMemories } from "@/context/memory-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Filter,
  Calendar,
  Tag,
  Grid3X3,
  Loader2,
  Image,
  Video,
  Mic,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns"
import { EmptyState } from "@/components/empty-state"

export default function TimelinePage() {
  const { memories, loading } = useMemories()
  const [view, setView] = useState("chronological")
  const [filter, setFilter] = useState("all")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Filter memories based on type
  const filteredMemories = useMemo(() => {
    if (filter === "all") return memories
    return memories.filter((memory) => memory.type === filter)
  }, [memories, filter])

  // Get all unique tags from memories
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    memories.forEach((memory) => {
      memory.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [memories])

  // Group memories by year and month for chronological view
  const timelineData = useMemo(() => {
    const data: {
      year: number
      months: {
        month: string
        memories: typeof memories
      }[]
    }[] = []

    // Sort memories by date (newest first)
    const sortedMemories = [...filteredMemories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    sortedMemories.forEach((memory) => {
      const date = new Date(memory.date)
      const year = date.getFullYear()
      const month = format(date, "MMMM")

      // Find or create year entry
      let yearEntry = data.find((y) => y.year === year)
      if (!yearEntry) {
        yearEntry = { year, months: [] }
        data.push(yearEntry)
      }

      // Find or create month entry
      let monthEntry = yearEntry.months.find((m) => m.month === month)
      if (!monthEntry) {
        monthEntry = { month, memories: [] }
        yearEntry.months.push(monthEntry)
      }

      // Add memory to month
      monthEntry.memories.push(memory)
    })

    // Sort years (newest first)
    data.sort((a, b) => b.year - a.year)

    return data
  }, [filteredMemories])

  // Calendar view data
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Map memories to days
    return days.map((day) => {
      const dayMemories = filteredMemories.filter((memory) => isSameDay(new Date(memory.date), day))

      return {
        date: day,
        memories: dayMemories,
        hasMemories: dayMemories.length > 0,
      }
    })
  }, [currentMonth, filteredMemories])

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  // Go to current month
  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  // Get memory type icon
  const getMemoryTypeIcon = (type: string) => {
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
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading timeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Timeline</h1>
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="photo">Photos</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="text">Text</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={view} onValueChange={setView} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="chronological" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Chronological
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            By Tags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chronological" className="space-y-8">
          {timelineData.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium mb-2">Timeline</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your memories will be displayed here in chronological order once you start adding them.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            timelineData.map((yearData) => (
              <div key={yearData.year} className="space-y-4">
                <h2 className="text-2xl font-bold sticky top-0 bg-background py-2 z-10">{yearData.year}</h2>
                {yearData.months.map((monthData) => (
                  <Card key={`${yearData.year}-${monthData.month}`} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <CardTitle>
                        {monthData.month} {yearData.year}
                      </CardTitle>
                      <CardDescription>{monthData.memories.length} memories</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {monthData.memories.map((memory) => (
                        <Link href={`/memory/${memory.id}`} key={memory.id} className="block">
                          <div className="border rounded-lg overflow-hidden hover:shadow-md transition-all">
                            <div className="aspect-video relative bg-muted">
                              {memory.mediaUrl && (memory.type === "photo" || memory.type === "video") ? (
                                <img
                                  src={memory.mediaUrl || "/placeholder.svg"}
                                  alt={memory.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  {getMemoryTypeIcon(memory.type)}
                                </div>
                              )}
                              <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  {getMemoryTypeIcon(memory.type)}
                                  {memory.type.charAt(0).toUpperCase() + memory.type.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <div className="p-3">
                              <h3 className="font-medium truncate">{memory.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(memory.date), "MMMM d, yyyy")}
                              </p>
                              {memory.location && (
                                <p className="text-xs text-muted-foreground truncate">{memory.location}</p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader className="pb-2 bg-gradient-to-r from-background to-muted/30 backdrop-blur-sm border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-2xl font-light tracking-wide flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  {format(currentMonth, "MMMM yyyy")}
                </CardTitle>
                <div className="flex items-center">
                  <div className="bg-background/80 backdrop-blur-sm rounded-lg p-1 flex items-center shadow-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevMonth}
                      className="h-8 w-8 p-0 rounded-md hover:bg-primary/10 hover:text-primary"
                    >
                      <span className="sr-only">Previous month</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToToday}
                      className="h-8 text-xs mx-1 hover:bg-primary/10 hover:text-primary"
                    >
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextMonth}
                      className="h-8 w-8 p-0 rounded-md hover:bg-primary/10 hover:text-primary"
                    >
                      <span className="sr-only">Next month</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="font-medium text-sm py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the start of the month */}
                {Array.from({ length: calendarDays[0]?.date.getDay() || 0 }).map((_, i) => (
                  <div key={`empty-start-${i}`} className="aspect-square p-1"></div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day) => (
                  <div
                    key={day.date.toISOString()}
                    className={`aspect-square p-1 relative ${
                      day.hasMemories ? "cursor-pointer hover:bg-accent/50 transition-colors" : ""
                    }`}
                  >
                    <div
                      className={`h-full w-full rounded-md border ${
                        day.hasMemories ? "border-primary bg-primary/10" : "border-muted"
                      } flex flex-col items-center justify-start p-1`}
                    >
                      <span className="text-sm font-medium">{format(day.date, "d")}</span>
                      {day.hasMemories && (
                        <div className="mt-auto mb-1 flex flex-wrap justify-center gap-1">
                          {day.memories.slice(0, 3).map((memory, i) => (
                            <Link href={`/memory/${memory.id}`} key={memory.id}>
                              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                {getMemoryTypeIcon(memory.type)}
                              </div>
                            </Link>
                          ))}
                          {day.memories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{day.memories.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty cells for days after the end of the month */}
                {Array.from({ length: 6 - (calendarDays[calendarDays.length - 1]?.date.getDay() || 0) }).map((_, i) => (
                  <div key={`empty-end-${i}`} className="aspect-square p-1"></div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Legend</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-primary/10 border border-primary"></div>
                  <span className="text-sm">Days with memories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Photo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Video</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Audio</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Text</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Browse by Tags</CardTitle>
              <CardDescription>Click on a tag to see all memories with that tag</CardDescription>
            </CardHeader>
            <CardContent>
              {allTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge key={tag} className="cursor-pointer text-sm py-1.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <EmptyState title="No tags yet" description="Add tags to your memories to organize them better" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

