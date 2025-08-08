"use client"

import { useState } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Plus, Loader2, AlertCircle, Image, Video, Mic, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export default function MemoryMapPage() {
  const { memories, loading } = useMemories()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  // Filter memories that have location data
  const memoriesWithLocation = memories.filter((memory) => memory.location && memory.location.trim() !== "")

  // Apply search filter if any
  const filteredMemories = searchQuery
    ? memoriesWithLocation.filter(
        (memory) =>
          memory.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memory.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : memoriesWithLocation

  // Group memories by location
  const memoriesByLocation = filteredMemories.reduce(
    (acc, memory) => {
      if (!memory.location) return acc

      if (!acc[memory.location]) {
        acc[memory.location] = []
      }

      acc[memory.location].push(memory)
      return acc
    },
    {} as Record<string, typeof memories>,
  )

  // Get unique locations
  const locations = Object.keys(memoriesByLocation).sort()

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location === selectedLocation ? null : location)
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

  if (memoriesWithLocation.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Memory Map</h1>
        <EmptyState
          title="No locations found"
          description="Add location information to your memories to see them on the map"
          action={
            <Button asChild>
              <Link href="/upload">
                <Plus className="h-4 w-4 mr-2" />
                Add Memory with Location
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Memory Map</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Explore Your Memories by Location</AlertTitle>
        <AlertDescription>
          Browse your memories organized by location. Select a location to see all memories from that place.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>Browse memories by location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {locations.length > 0 ? (
                  locations.map((location) => (
                    <div
                      key={location}
                      className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
                        selectedLocation === location ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                      }`}
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{location}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {memoriesByLocation[location].length}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No locations found matching your search</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{selectedLocation ? `Memories from ${selectedLocation}` : "Select a Location"}</CardTitle>
              <CardDescription>
                {selectedLocation
                  ? `${memoriesByLocation[selectedLocation].length} memories found`
                  : "Click on a location to view memories from that place"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedLocation ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {memoriesByLocation[selectedLocation].map((memory) => (
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
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Location</h3>
                  <p className="text-muted-foreground max-w-md">
                    Choose a location from the list to view all memories from that place.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
