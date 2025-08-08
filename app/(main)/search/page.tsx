"use client"

import { useState, useMemo } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  CalendarIcon,
  MapPin,
  Tag,
  ImageIcon,
  Video,
  Mic,
  FileText,
  Heart,
  Clock,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  X,
  Download,
} from "lucide-react"
import { format, isAfter, isBefore } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/empty-state"

type SortOption = "date-desc" | "date-asc" | "title-asc" | "title-desc" | "type"
type ViewMode = "grid" | "list"

export default function SearchPage() {
  const { memories, loading } = useMemories()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showTimeCapsules, setShowTimeCapsules] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("date-desc")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showFilters, setShowFilters] = useState(false)

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    memories.forEach((memory) => {
      memory.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [memories])

  // Filter and sort memories
  const filteredMemories = useMemo(() => {
    const filtered = memories.filter((memory) => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = memory.title.toLowerCase().includes(query)
        const matchesDescription = memory.description?.toLowerCase().includes(query)
        const matchesLocation = memory.location?.toLowerCase().includes(query)
        const matchesTags = memory.tags.some((tag) => tag.toLowerCase().includes(query))
        const matchesContent = memory.content?.toLowerCase().includes(query)

        if (!matchesTitle && !matchesDescription && !matchesLocation && !matchesTags && !matchesContent) {
          return false
        }
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some((tag) => memory.tags.includes(tag))
        if (!hasSelectedTag) return false
      }

      // Type filter
      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(memory.type)) return false
      }

      // Date range filter
      if (dateRange.from || dateRange.to) {
        const memoryDate = new Date(memory.date)
        if (dateRange.from && isBefore(memoryDate, dateRange.from)) return false
        if (dateRange.to && isAfter(memoryDate, dateRange.to)) return false
      }

      // Favorites filter
      if (showFavoritesOnly && !memory.isLiked) return false

      // Time capsules filter
      if (showTimeCapsules && !memory.isTimeCapsule) return false

      return true
    })

    // Sort memories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "title-asc":
          return a.title.localeCompare(b.title)
        case "title-desc":
          return b.title.localeCompare(a.title)
        case "type":
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })

    return filtered
  }, [memories, searchQuery, selectedTags, selectedTypes, dateRange, showFavoritesOnly, showTimeCapsules, sortBy])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
    setSelectedTypes([])
    setDateRange({})
    setShowFavoritesOnly(false)
    setShowTimeCapsules(false)
  }

  const exportResults = () => {
    const data = filteredMemories.map((memory) => ({
      title: memory.title,
      description: memory.description,
      date: format(new Date(memory.date), "yyyy-MM-dd"),
      location: memory.location,
      tags: memory.tags.join(", "),
      type: memory.type,
    }))

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map((row) =>
        Object.values(row)
          .map((val) => `"${val || ""}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `memories-search-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Search className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading memories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Search Memories</h1>
          <p className="text-muted-foreground">
            Found {filteredMemories.length} of {memories.length} memories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
          {filteredMemories.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportResults}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search memories by title, description, location, tags, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-12"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Active Filters */}
      {(selectedTags.length > 0 ||
        selectedTypes.length > 0 ||
        dateRange.from ||
        dateRange.to ||
        showFavoritesOnly ||
        showTimeCapsules) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => toggleTag(tag)}>
              {tag} <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {selectedTypes.map((type) => (
            <Badge key={type} variant="secondary" className="cursor-pointer" onClick={() => toggleType(type)}>
              {type} <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {dateRange.from && <Badge variant="secondary">From: {format(dateRange.from, "MMM d, yyyy")}</Badge>}
          {dateRange.to && <Badge variant="secondary">To: {format(dateRange.to, "MMM d, yyyy")}</Badge>}
          {showFavoritesOnly && <Badge variant="secondary">Favorites</Badge>}
          {showTimeCapsules && <Badge variant="secondary">Time Capsules</Badge>}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tags" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tags">Tags</TabsTrigger>
                <TabsTrigger value="types">Types</TabsTrigger>
                <TabsTrigger value="dates">Dates</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
              </TabsList>

              <TabsContent value="tags" className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {allTags.length === 0 && <p className="text-muted-foreground text-sm">No tags available</p>}
                </div>
              </TabsContent>

              <TabsContent value="types" className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { type: "photo", icon: ImageIcon, label: "Photos" },
                    { type: "video", icon: Video, label: "Videos" },
                    { type: "audio", icon: Mic, label: "Audio" },
                    { type: "text", icon: FileText, label: "Text" },
                  ].map(({ type, icon: Icon, label }) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => toggleType(type)}
                      />
                      <label htmlFor={type} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="h-4 w-4" />
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="dates" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">From Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? format(dateRange.from, "MMM d, yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">To Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="options" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="favorites" checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} />
                    <label htmlFor="favorites" className="flex items-center gap-2 cursor-pointer">
                      <Heart className="h-4 w-4" />
                      Show favorites only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="timecapsules" checked={showTimeCapsules} onCheckedChange={setShowTimeCapsules} />
                    <label htmlFor="timecapsules" className="flex items-center gap-2 cursor-pointer">
                      <Clock className="h-4 w-4" />
                      Show time capsules only
                    </label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">
              <div className="flex items-center gap-2">
                <SortDesc className="h-4 w-4" />
                Newest first
              </div>
            </SelectItem>
            <SelectItem value="date-asc">
              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4" />
                Oldest first
              </div>
            </SelectItem>
            <SelectItem value="title-asc">Title A-Z</SelectItem>
            <SelectItem value="title-desc">Title Z-A</SelectItem>
            <SelectItem value="type">Type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {filteredMemories.length === 0 ? (
        <EmptyState
          title="No memories found"
          description="Try adjusting your search criteria or filters"
          action={<Button onClick={clearFilters}>Clear Filters</Button>}
        />
      ) : (
        <div
          className={cn(
            viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-4",
          )}
        >
          {filteredMemories.map((memory) => (
            <Link href={`/memory/${memory.id}`} key={memory.id}>
              <Card className="hover:shadow-md transition-shadow">
                {viewMode === "grid" ? (
                  <>
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      {memory.mediaUrl && (memory.type === "photo" || memory.type === "video") ? (
                        <img
                          src={memory.mediaUrl || "/placeholder.svg"}
                          alt={memory.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          {memory.type === "photo" && <ImageIcon className="h-12 w-12 text-muted-foreground" />}
                          {memory.type === "video" && <Video className="h-12 w-12 text-muted-foreground" />}
                          {memory.type === "audio" && <Mic className="h-12 w-12 text-muted-foreground" />}
                          {memory.type === "text" && <FileText className="h-12 w-12 text-muted-foreground" />}
                        </div>
                      )}
                      {memory.isLiked && <Heart className="absolute top-2 right-2 h-5 w-5 text-red-500 fill-current" />}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium truncate">{memory.title}</h3>
                      <p className="text-sm text-muted-foreground">{format(new Date(memory.date), "MMM d, yyyy")}</p>
                      {memory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
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
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {memory.mediaUrl && (memory.type === "photo" || memory.type === "video") ? (
                        <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={memory.mediaUrl || "/placeholder.svg"}
                            alt={memory.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                          {memory.type === "photo" && <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                          {memory.type === "video" && <Video className="h-8 w-8 text-muted-foreground" />}
                          {memory.type === "audio" && <Mic className="h-8 w-8 text-muted-foreground" />}
                          {memory.type === "text" && <FileText className="h-8 w-8 text-muted-foreground" />}
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{memory.title}</h4>
                          <div className="flex items-center space-x-1">
                            {memory.isLiked && <Heart className="h-4 w-4 text-red-500 fill-current" />}
                            {memory.type === "photo" && <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                            {memory.type === "video" && <Video className="h-4 w-4 text-muted-foreground" />}
                            {memory.type === "audio" && <Mic className="h-4 w-4 text-muted-foreground" />}
                            {memory.type === "text" && <FileText className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{format(new Date(memory.date), "MMMM d, yyyy")}</p>
                        {memory.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {memory.location}
                          </p>
                        )}
                        {memory.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{memory.description}</p>
                        )}
                        {memory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {memory.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
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
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
