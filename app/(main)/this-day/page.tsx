"use client"

import { useState, useEffect } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  AlertCircle,
  Image,
  Video,
  Mic,
  FileText,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { format, isSameMonth, isSameDay, addDays, subDays } from "date-fns"
import { Badge } from "@/components/ui/badge"

export default function ThisDayPage() {
  const { memories, loading } = useMemories()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [yearGroups, setYearGroups] = useState<Record<number, typeof memories>>({})

  // Group memories by year for the selected day
  useEffect(() => {
    const groups: Record<number, typeof memories> = {}

    memories.forEach((memory) => {
      const memoryDate = new Date(memory.date)

      // Check if memory is from the same day and month (any year)
      if (isSameMonth(memoryDate, selectedDate) && isSameDay(memoryDate, selectedDate)) {
        const year = memoryDate.getFullYear()

        if (!groups[year]) {
          groups[year] = []
        }

        groups[year].push(memory)
      }
    })

    // Sort years in descending order
    const sortedGroups: Record<number, typeof memories> = {}
    Object.keys(groups)
      .map(Number)
      .sort((a, b) => b - a)
      .forEach((year) => {
        sortedGroups[year] = groups[year]
      })

    setYearGroups(sortedGroups)
  }, [memories, selectedDate])

  const navigateDay = (direction: "prev" | "next") => {
    setSelectedDate((current) => (direction === "prev" ? subDays(current, 1) : addDays(current, 1)))
  }

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
          <p className="text-muted-foreground">Loading memories...</p>
        </div>
      </div>
    )
  }

  const hasMemoriesOnThisDay = Object.keys(yearGroups).length > 0
  const totalMemories = Object.values(yearGroups).flat().length

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">This Day in Your Memories</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Memories from the past</AlertTitle>
        <AlertDescription>
          Rediscover what happened on this day throughout your history. Navigate through different days to see your
          memories.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => navigateDay("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{format(selectedDate, "MMMM d")}</h2>
            </div>

            <Button variant="outline" size="icon" onClick={() => navigateDay("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {!hasMemoriesOnThisDay ? (
        <EmptyState
          title={`No memories on ${format(selectedDate, "MMMM d")}`}
          description="You don't have any memories recorded for this day. Try another date or add a new memory."
          action={
            <Button asChild>
              <Link href="/upload">
                <Plus className="h-4 w-4 mr-2" />
                Add Memory
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {totalMemories} {totalMemories === 1 ? "memory" : "memories"} on {format(selectedDate, "MMMM d")}
            </h3>
          </div>

          {Object.entries(yearGroups).map(([year, yearMemories]) => (
            <div key={year} className="space-y-4">
              <h3 className="text-xl font-bold">{year}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {yearMemories.map((memory) => (
                  <Link href={`/memory/${memory.id}`} key={memory.id}>
                    <Card className="hover:bg-accent/50 transition-colors h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {memory.mediaUrl && (memory.type === "photo" || memory.type === "video") ? (
                            <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                              <img
                                src={memory.mediaUrl || "/placeholder.svg"}
                                alt={memory.title}
                                className="h-full w-full object-cover"
                              />
                              {memory.type === "video" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Video className="h-8 w-8 text-white" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                              {memory.type === "audio" && <Mic className="h-8 w-8 text-muted-foreground" />}
                              {memory.type === "text" && <FileText className="h-8 w-8 text-muted-foreground" />}
                              {memory.type === "photo" && <Image className="h-8 w-8 text-muted-foreground" />}
                              {memory.type === "video" && <Video className="h-8 w-8 text-muted-foreground" />}
                            </div>
                          )}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{memory.title}</h4>
                              <div className="flex items-center space-x-1">{getMemoryTypeIcon(memory.type)}</div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(memory.date), "MMMM d, yyyy")}
                            </p>
                            {memory.location && <p className="text-sm text-muted-foreground">{memory.location}</p>}
                            {memory.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {memory.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
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
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

