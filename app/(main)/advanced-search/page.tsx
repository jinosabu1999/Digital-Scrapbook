"use client"

import { useState, useMemo } from "react"
import { useMemories } from "@/context/memory-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  Search,
  Filter,
  CalendarIcon,
  Tag,
  Heart,
  ImageIcon,
  Video,
  Mic,
  FileText,
  Sparkles,
  X,
  SortAsc,
  SortDesc,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function AdvancedSearchPage() {
  const { memories } = useMemories()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [contentTypes, setContentTypes] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [sortBy, setSortBy] = useState<"date" | "title" | "relevance">("relevance")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [aiSuggestions, setAiSuggestions] = useState(true)

  // Get all unique tags and moods from memories
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    memories.forEach((memory) => memory.tags?.forEach((tag) => tags.add(tag)))
    return Array.from(tags)
  }, [memories])

  const allMoods = useMemo(() => {
    const moods = new Set<string>()
    memories.forEach((memory) => memory.mood && moods.add(memory.mood))
    return Array.from(moods)
  }, [memories])

  // AI-powered search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || !aiSuggestions) return []

    const suggestions = [
      "happy moments with family",
      "vacation photos from last summer",
      "memories with friends",
      "special celebrations",
      "quiet peaceful moments",
      "adventures and travels",
    ]

    return suggestions.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
  }, [searchQuery, aiSuggestions])

  // Filter memories based on search criteria
  const filteredMemories = useMemo(() => {
    let filtered = memories

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(
        (memory) =>
          memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memory.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memory.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((memory) => selectedTags.every((tag) => memory.tags?.includes(tag)))
    }

    // Mood filter
    if (selectedMoods.length > 0) {
      filtered = filtered.filter((memory) => memory.mood && selectedMoods.includes(memory.mood))
    }

    // Content type filter
    if (contentTypes.length > 0) {
      filtered = filtered.filter((memory) => contentTypes.includes(memory.type))
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((memory) => {
        const memoryDate = new Date(memory.createdAt)
        if (dateRange.from && memoryDate < dateRange.from) return false
        if (dateRange.to && memoryDate > dateRange.to) return false
        return true
      })
    }

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "relevance":
          // Simple relevance based on query matches
          const aMatches =
            (a.title + " " + (a.description || "")).toLowerCase().split(searchQuery.toLowerCase()).length - 1
          const bMatches =
            (b.title + " " + (b.description || "")).toLowerCase().split(searchQuery.toLowerCase()).length - 1
          comparison = bMatches - aMatches
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [memories, searchQuery, selectedTags, selectedMoods, contentTypes, dateRange, sortBy, sortOrder])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
    setSelectedMoods([])
    setContentTypes([])
    setDateRange({})
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) => (prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]))
  }

  const toggleContentType = (type: string) => {
    setContentTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <Search className="mr-2 h-8 w-8 text-blue-500" />
            Advanced Search
          </h1>
          <p className="text-muted-foreground">
            Find exactly what you're looking for with powerful search and filtering
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Suggestions Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-suggestions" className="flex items-center">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Suggestions
                </Label>
                <Switch id="ai-suggestions" checked={aiSuggestions} onCheckedChange={setAiSuggestions} />
              </div>

              {/* Content Types */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Content Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: "photo", icon: ImageIcon, label: "Photos" },
                    { type: "video", icon: Video, label: "Videos" },
                    { type: "audio", icon: Mic, label: "Audio" },
                    { type: "text", icon: FileText, label: "Text" },
                  ].map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      variant={contentTypes.includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleContentType(type)}
                      className="justify-start"
                    >
                      <Icon className="mr-2 h-3 w-3" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Date Range</Label>
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "PPP") : "From date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.to && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "PPP") : "To date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Tags */}
              {allTags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-1">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Moods */}
              {allMoods.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Mood</Label>
                  <div className="flex flex-wrap gap-1">
                    {allMoods.map((mood) => (
                      <Badge
                        key={mood}
                        variant={selectedMoods.includes(mood) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleMood(mood)}
                      >
                        <Heart className="mr-1 h-3 w-3" />
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Input */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* AI Suggestions */}
              {searchSuggestions.length > 0 && (
                <div className="mt-3">
                  <Label className="text-xs text-muted-foreground mb-2 block flex items-center">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI Suggestions
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {searchSuggestions.map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sort Controls */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Found {filteredMemories.length} memories</p>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
              >
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Results */}
          {filteredMemories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No memories found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search criteria or clearing some filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMemories.map((memory) => (
                <Card key={memory.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{memory.title}</CardTitle>
                        <CardDescription>{format(new Date(memory.createdAt), "PPP")}</CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {memory.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {memory.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{memory.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {memory.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {memory.tags && memory.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{memory.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      {memory.mood && (
                        <Badge variant="outline" className="text-xs">
                          {memory.mood}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
