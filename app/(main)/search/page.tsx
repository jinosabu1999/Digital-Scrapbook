"use client"

import { useState } from "react"
import { useMemories, type MemoryType } from "@/context/memory-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Image, Video, Mic, FileText, SearchIcon, CalendarIcon, Loader2, X } from "lucide-react"
import Link from "next/link"
import { format, isAfter, isBefore, isEqual, startOfDay, endOfDay, subMonths } from "date-fns"
import { EmptyState } from "@/components/empty-state"

export default function SearchPage() {
  const { memories, loading } = useMemories()

  // Search parameters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<MemoryType[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [isLiked, setIsLiked] = useState<boolean | null>(null)
  const [isTimeCapsule, setIsTimeCapsule] = useState<boolean | null>(null)
  const [dateOpen, setDateOpen] = useState(false)

  // Results
  const [searchResults, setSearchResults] = useState(memories)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Get all unique tags from memories
  const allTags = [...new Set(memories.flatMap((memory) => memory.tags))].sort()

  // Handle type selection
  const toggleType = (type: MemoryType) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTypes([])
    setSelectedTags([])
    setDateRange({ from: undefined, to: undefined })
    setIsLiked(null)
    setIsTimeCapsule(null)
    setHasSearched(false)
  }

  // Perform search
  const handleSearch = () => {
    setIsSearching(true)
    setHasSearched(true)

    // Filter memories based on search criteria
    let results = [...memories]

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (memory) =>
          memory.title.toLowerCase().includes(query) ||
          memory.description?.toLowerCase().includes(query) ||
          memory.location?.toLowerCase().includes(query) ||
          memory.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          memory.content?.toLowerCase().includes(query),
      )
    }

    // Type filter
    if (selectedTypes.length > 0) {
      results = results.filter((memory) => selectedTypes.includes(memory.type))
    }

    // Tags filter
    if (selectedTags.length > 0) {
      results = results.filter((memory) => selectedTags.every((tag) => memory.tags.includes(tag)))
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      results = results.filter((memory) => {
        const memoryDate = new Date(memory.date)

        if (dateRange.from && dateRange.to) {
          return (
            (isAfter(memoryDate, startOfDay(dateRange.from)) || isEqual(memoryDate, startOfDay(dateRange.from))) &&
            (isBefore(memoryDate, endOfDay(dateRange.to)) || isEqual(memoryDate, endOfDay(dateRange.to)))
          )
        } else if (dateRange.from) {
          return isAfter(memoryDate, startOfDay(dateRange.from)) || isEqual(memoryDate, startOfDay(dateRange.from))
        } else if (dateRange.to) {
          return isBefore(memoryDate, endOfDay(dateRange.to)) || isEqual(memoryDate, endOfDay(dateRange.to))
        }

        return true
      })
    }

    // Liked filter
    if (isLiked !== null) {
      results = results.filter((memory) => memory.isLiked === isLiked)
    }

    // Time capsule filter
    if (isTimeCapsule !== null) {
      results = results.filter((memory) => memory.isTimeCapsule === isTimeCapsule)
    }

    // Sort by date (newest first)
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setSearchResults(results)
    setIsSearching(false)
  }

  // Predefined date ranges
  const setLastMonth = () => {
    const today = new Date()
    setDateRange({
      from: subMonths(today, 1),
      to: today,
    })
  }

  const setLast3Months = () => {
    const today = new Date()
    setDateRange({
      from: subMonths(today, 3),
      to: today,
    })
  }

  const setLastYear = () => {
    const today = new Date()
    setDateRange({
      from: subMonths(today, 12),
      to: today,
    })
  }

  // Get memory type icon
  const getMemoryTypeIcon = (type: MemoryType) => {
    switch (type) {
      case "photo":
        return <Image className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Mic className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your memories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Advanced Search</h1>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
              <CardDescription>Refine your search with multiple criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search Text</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search in titles, descriptions, tags..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Memory type filter */}
              <div className="space-y-2">
                <Label>Memory Type</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTypes.includes("photo") ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleType("photo")}
                    className="flex items-center gap-1"
                  >
                    <Image className="h-4 w-4" />
                    <span>Photos</span>
                  </Button>
                  <Button
                    variant={selectedTypes.includes("video") ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleType("video")}
                    className="flex items-center gap-1"
                  >
                    <Video className="h-4 w-4" />
                    <span>Videos</span>
                  </Button>
                  <Button
                    variant={selectedTypes.includes("audio") ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleType("audio")}
                    className="flex items-center gap-1"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Audio</span>
                  </Button>
                  <Button
                    variant={selectedTypes.includes("text") ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleType("text")}
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Text</span>
                  </Button>
                </div>
              </div>

              {/* Date range filter */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange.from && !dateRange.to && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : dateRange.to ? (
                          format(dateRange.to, "LLL dd, y")
                        ) : (
                          <span>Select date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                      <div className="flex gap-2 p-3 border-t">
                        <Button size="sm" variant="outline" onClick={setLastMonth}>
                          Last Month
                        </Button>
                        <Button size="sm" variant="outline" onClick={setLast3Months}>
                          Last 3 Months
                        </Button>
                        <Button size="sm" variant="outline" onClick={setLastYear}>
                          Last Year
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {(dateRange.from || dateRange.to) && (
                    <Button
                      variant="ghost"
                      onClick={() => setDateRange({ from: undefined, to: undefined })}
                      className="flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear date</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Tags filter */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="max-h-40 overflow-y-auto p-1 border rounded-md">
                  <div className="flex flex-wrap gap-1">
                    {allTags.length > 0 ? (
                      allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">No tags found</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional filters */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="liked"
                    checked={isLiked === true}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setIsLiked(true)
                      } else {
                        setIsLiked(null)
                      }
                    }}
                  />
                  <Label htmlFor="liked">Favorites only</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="timeCapsule"
                    checked={isTimeCapsule === true}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setIsTimeCapsule(true)
                      } else {
                        setIsTimeCapsule(null)
                      }
                    }}
                  />
                  <Label htmlFor="timeCapsule">Time capsules only</Label>
                </div>
              </div>

              <Button className="w-full" onClick={handleSearch}>
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="mr-2 h-4 w-4" />
                    Search Memories
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {hasSearched
                  ? `Found ${searchResults.length} ${searchResults.length === 1 ? "memory" : "memories"}`
                  : "Use the filters to search your memories"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!hasSearched ? (
                <EmptyState
                  title="Start Searching"
                  description="Use the filters on the left to find specific memories"
                  icon={<SearchIcon className="h-12 w-12 text-muted-foreground" />}
                  action={
                    <Button onClick={handleSearch}>
                      <SearchIcon className="mr-2 h-4 w-4" />
                      Search All Memories
                    </Button>
                  }
                />
              ) : searchResults.length === 0 ? (
                <EmptyState
                  title="No results found"
                  description="Try adjusting your search filters"
                  icon={<SearchIcon className="h-12 w-12 text-muted-foreground" />}
                  action={
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  }
                />
              ) : (
                <Tabs defaultValue="grid">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="grid" className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <span>Grid</span>
                      </TabsTrigger>
                      <TabsTrigger value="list" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>List</span>
                      </TabsTrigger>
                    </TabsList>

                    <Select defaultValue="newest">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="title">Title (A-Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <TabsContent value="grid" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.map((memory) => (
                        <Link href={`/memory/${memory.id}`} key={memory.id}>
                          <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                            <div className="aspect-video relative bg-muted">
                              {memory.mediaUrl ? (
                                memory.type === "photo" ? (
                                  <img
                                    src={memory.mediaUrl || "/placeholder.svg"}
                                    alt={memory.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : memory.type === "video" ? (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Video className="h-12 w-12 text-muted-foreground" />
                                  </div>
                                ) : memory.type === "audio" ? (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Mic className="h-12 w-12 text-muted-foreground" />
                                  </div>
                                ) : null
                              ) : memory.type === "text" ? (
                                <div className="h-full w-full flex items-center justify-center">
                                  <FileText className="h-12 w-12 text-muted-foreground" />
                                </div>
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
                            <CardContent className="p-4">
                              <h3 className="font-bold text-lg line-clamp-1">{memory.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(memory.date), "MMMM d, yyyy")}
                              </p>
                              {memory.location && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{memory.location}</p>
                              )}
                              {memory.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {memory.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {memory.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{memory.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="list" className="mt-0">
                    <div className="space-y-2">
                      {searchResults.map((memory) => (
                        <Link href={`/memory/${memory.id}`} key={memory.id}>
                          <Card className="hover:bg-accent/50 transition-colors">
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
                                    <div className="flex items-center space-x-1">
                                      {memory.type === "photo" && <Image className="h-4 w-4 text-muted-foreground" />}
                                      {memory.type === "video" && <Video className="h-4 w-4 text-muted-foreground" />}
                                      {memory.type === "audio" && <Mic className="h-4 w-4 text-muted-foreground" />}
                                      {memory.type === "text" && <FileText className="h-4 w-4 text-muted-foreground" />}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(memory.date), "MMMM d, yyyy")}
                                  </p>
                                  {memory.location && (
                                    <p className="text-sm text-muted-foreground">{memory.location}</p>
                                  )}
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
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

