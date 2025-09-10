"use client"

import { useState, useEffect, useRef } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Video,
  Mic,
  FileText,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import type { Memory } from "@/types"

type TimelineZoom = "decade" | "year" | "month" | "day"

interface TimelineNode {
  date: Date
  memories: Memory[]
  position: number
}

export function InteractiveTimeline() {
  const { memories, loading } = useMemories()
  const timelineRef = useRef<HTMLDivElement>(null)

  const [zoom, setZoom] = useState<TimelineZoom>("year")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [timelineNodes, setTimelineNodes] = useState<TimelineNode[]>([])
  const [displayMemories, setDisplayMemories] = useState<Memory[]>([])

  // Generate timeline nodes based on zoom level
  useEffect(() => {
    // Filter memories based on search inside useEffect
    const filteredMemories = memories.filter(
      (memory) =>
        memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    setDisplayMemories(filteredMemories)

    if (filteredMemories.length === 0) {
      setTimelineNodes([])
      return
    }

    const sortedMemories = [...filteredMemories].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const nodes: TimelineNode[] = []
    const groupedMemories = new Map<string, Memory[]>()

    // Group memories by time period based on zoom level
    sortedMemories.forEach((memory) => {
      const memoryDate = new Date(memory.date)
      let key: string

      switch (zoom) {
        case "decade":
          key = Math.floor(memoryDate.getFullYear() / 10) * 10 + "s"
          break
        case "year":
          key = memoryDate.getFullYear().toString()
          break
        case "month":
          key = format(memoryDate, "yyyy-MM")
          break
        case "day":
          key = format(memoryDate, "yyyy-MM-dd")
          break
      }

      if (!groupedMemories.has(key)) {
        groupedMemories.set(key, [])
      }
      groupedMemories.get(key)!.push(memory)
    })

    // Convert to timeline nodes with positions
    const entries = Array.from(groupedMemories.entries())
    entries.forEach(([key, memories], index) => {
      let date: Date

      switch (zoom) {
        case "decade":
          date = new Date(Number.parseInt(key.replace("s", "")), 0, 1)
          break
        case "year":
          date = new Date(Number.parseInt(key), 0, 1)
          break
        case "month":
          const [year, month] = key.split("-")
          date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
          break
        case "day":
          date = new Date(key)
          break
      }

      nodes.push({
        date,
        memories,
        position: (index / (entries.length - 1 || 1)) * 100,
      })
    })

    setTimelineNodes(nodes)
  }, [memories, searchQuery, zoom]) // Fixed dependencies to prevent infinite loop

  const getMemoryIcon = (type: Memory["type"]) => {
    switch (type) {
      case "photo":
        return ImageIcon
      case "video":
        return Video
      case "audio":
        return Mic
      case "text":
        return FileText
      default:
        return ImageIcon
    }
  }

  const formatNodeLabel = (date: Date, zoom: TimelineZoom) => {
    switch (zoom) {
      case "decade":
        return Math.floor(date.getFullYear() / 10) * 10 + "s"
      case "year":
        return date.getFullYear().toString()
      case "month":
        return format(date, "MMM yyyy")
      case "day":
        return format(date, "MMM d, yyyy")
    }
  }

  const navigateTime = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)

    switch (zoom) {
      case "decade":
        newDate.setFullYear(newDate.getFullYear() + (direction === "next" ? 10 : -10))
        break
      case "year":
        newDate.setFullYear(newDate.getFullYear() + (direction === "next" ? 1 : -1))
        break
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
        break
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
        break
    }

    setSelectedDate(newDate)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading timeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Memory Timeline</h1>
        <p className="text-muted-foreground">Explore your memories through time with interactive zoom levels</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateTime("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center min-w-[120px]">
            <p className="font-medium">{formatNodeLabel(selectedDate, zoom)}</p>
          </div>

          <Button variant="outline" size="icon" onClick={() => navigateTime("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={zoom} onValueChange={(v) => setZoom(v as TimelineZoom)}>
          <TabsList>
            <TabsTrigger value="decade">Decade</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search memories..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="relative mb-8">
        <Card className="p-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border transform -translate-y-1/2" />

            {/* Timeline Nodes */}
            <div className="relative h-24 flex items-center">
              {timelineNodes.map((node, index) => (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 cursor-pointer group"
                  style={{ left: `${node.position}%` }}
                  onClick={() => setSelectedMemory(node.memories[0])}
                >
                  {/* Node Circle */}
                  <div className="relative">
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        node.memories.some((m) => m.isLiked)
                          ? "bg-red-500 border-red-500"
                          : "bg-background border-primary"
                      } group-hover:scale-125 group-hover:border-primary`}
                    />

                    {/* Memory Count Badge */}
                    {node.memories.length > 1 && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs px-1.5 py-0.5"
                      >
                        {node.memories.length}
                      </Badge>
                    )}
                  </div>

                  {/* Node Label */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-xs font-medium whitespace-nowrap">{formatNodeLabel(node.date, zoom)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Memory Details */}
      {selectedMemory && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {selectedMemory.mediaUrl && (
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={selectedMemory.mediaUrl || "/placeholder.svg"}
                    alt={selectedMemory.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{selectedMemory.title}</h3>
                    {selectedMemory.description && (
                      <p className="text-muted-foreground mb-3">{selectedMemory.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedMemory.isLiked && <Heart className="h-5 w-5 text-red-500 fill-current" />}
                    <Button asChild size="sm">
                      <Link href={`/memory/${selectedMemory.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(selectedMemory.date), "MMMM d, yyyy")}
                  </div>

                  {selectedMemory.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedMemory.location}
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    {(() => {
                      const Icon = getMemoryIcon(selectedMemory.type)
                      return <Icon className="h-4 w-4" />
                    })()}
                    {selectedMemory.type}
                  </div>
                </div>

                {selectedMemory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {selectedMemory.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memory Grid for Selected Time Period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {timelineNodes
          .flatMap((node) => node.memories)
          .slice(0, 12)
          .map((memory) => (
            <Card key={memory.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <Link href={`/memory/${memory.id}`}>
                <div className="aspect-square relative bg-muted">
                  {memory.mediaUrl && (memory.type === "photo" || memory.type === "video") ? (
                    <img
                      src={memory.mediaUrl || "/placeholder.svg"}
                      alt={memory.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      {(() => {
                        const Icon = getMemoryIcon(memory.type)
                        return <Icon className="h-12 w-12 text-muted-foreground" />
                      })()}
                    </div>
                  )}

                  {memory.isLiked && (
                    <div className="absolute top-2 right-2">
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  <h4 className="font-medium truncate">{memory.title}</h4>
                  <p className="text-xs text-muted-foreground">{format(new Date(memory.date), "MMM d, yyyy")}</p>
                  {memory.location && (
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {memory.location}
                    </p>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
      </div>

      {/* No Memories Found Message */}
      {displayMemories.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No memories found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms" : "Start creating memories to see your timeline"}
          </p>
        </div>
      )}
    </div>
  )
}
