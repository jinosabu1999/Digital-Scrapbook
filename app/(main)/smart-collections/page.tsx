"use client"

import { useState } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Loader2,
  AlertCircle,
  Image,
  Video,
  Mic,
  FileText,
  Calendar,
  Heart,
  Star,
  Camera,
  MapPin,
  Sparkles,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { format, isThisYear, isThisMonth } from "date-fns"
import { Badge } from "@/components/ui/badge"

export default function SmartCollectionsPage() {
  const { memories, loading } = useMemories()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("recent")

  // Generate smart collections
  const collections = {
    recent: memories
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12),
    favorites: memories.filter((memory) => memory.isLiked),
    thisYear: memories.filter((memory) => isThisYear(new Date(memory.date))),
    thisMonth: memories.filter((memory) => isThisMonth(new Date(memory.date))),
    photos: memories.filter((memory) => memory.type === "photo"),
    videos: memories.filter((memory) => memory.type === "video"),
    withLocation: memories.filter((memory) => memory.location && memory.location.trim() !== ""),
    withoutLocation: memories.filter((memory) => !memory.location || memory.location.trim() === ""),
    recentlyViewed: [], // This would need actual view tracking
    highlights: memories.filter((memory) => memory.isLiked || memory.tags.length > 3).slice(0, 10),
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
          <p className="text-muted-foreground">Loading collections...</p>
        </div>
      </div>
    )
  }

  if (memories.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Smart Collections</h1>
        <EmptyState
          title="No memories yet"
          description="Add some memories to see them automatically organized into smart collections"
          action={
            <Button asChild>
              <Link href="/upload">
                <Plus className="h-4 w-4 mr-2" />
                Add Memory
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Smart Collections</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Automatically Organized</AlertTitle>
        <AlertDescription>
          Smart Collections automatically organize your memories based on various criteria, making it easy to find what
          you're looking for.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="recent" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Recent</span>
              <span className="sm:inline md:hidden">📅</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favorites</span>
              <span className="sm:inline md:hidden">❤️</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-1">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Media</span>
              <span className="sm:inline md:hidden">📷</span>
            </TabsTrigger>
            <TabsTrigger value="places" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Places</span>
              <span className="sm:inline md:hidden">📍</span>
            </TabsTrigger>
            <TabsTrigger value="highlights" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Highlights</span>
              <span className="sm:inline md:hidden">✨</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <Card>
              <CardHeader className="p-4 sm:p-6 flex flex-col gap-1">
                <CardTitle className="text-lg sm:text-xl">Recently Added</CardTitle>
                <CardDescription className="text-sm">Your most recently added memories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {collections.recent.map((memory) => (
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
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href="/memories">View All Memories</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/upload">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Memory
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader className="p-4 sm:p-6 flex flex-col gap-1">
                <CardTitle className="text-lg sm:text-xl">Favorites</CardTitle>
                <CardDescription className="text-sm">Memories you've marked as favorites</CardDescription>
              </CardHeader>
              <CardContent>
                {collections.favorites.length === 0 ? (
                  <EmptyState title="No favorites yet" description="Mark memories as favorites to see them here" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {collections.favorites.map((memory) => (
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
                                </div>
                              ) : (
                                <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                  {getMemoryTypeIcon(memory.type)}
                                </div>
                              )}
                              <div className="flex-1 space-y-1">
                                <h4 className="font-medium">{memory.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(memory.date), "MMMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="p-4 sm:p-6 flex flex-col gap-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Image className="h-5 w-5" />
                    Photos
                  </CardTitle>
                  <CardDescription className="text-sm">{collections.photos.length} photos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {collections.photos.slice(0, 6).map((memory) => (
                      <Link href={`/memory/${memory.id}`} key={memory.id}>
                        <div className="aspect-square rounded-md overflow-hidden">
                          <img
                            src={memory.mediaUrl || "/placeholder.svg"}
                            alt={memory.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/memories?type=photo">View All Photos</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="p-4 sm:p-6 flex flex-col gap-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Video className="h-5 w-5" />
                    Videos
                  </CardTitle>
                  <CardDescription className="text-sm">{collections.videos.length} videos</CardDescription>
                </CardHeader>
                <CardContent>
                  {collections.videos.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No videos yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {collections.videos.slice(0, 6).map((memory) => (
                        <Link href={`/memory/${memory.id}`} key={memory.id}>
                          <div className="aspect-square rounded-md overflow-hidden relative bg-muted">
                            {memory.mediaUrl ? (
                              <img
                                src={memory.mediaUrl || "/placeholder.svg"}
                                alt={memory.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Video className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Video className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/memories?type=video">View All Videos</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="places">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="p-4 sm:p-6 flex flex-col gap-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <MapPin className="h-5 w-5" />
                    Memories with Locations
                  </CardTitle>
                  <CardDescription className="text-sm">{collections.withLocation.length} memories</CardDescription>
                </CardHeader>
                <CardContent>
                  {collections.withLocation.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No memories with location data</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Array.from(new Set(collections.withLocation.map((m) => m.location)))
                        .slice(0, 5)
                        .map((location) => {
                          const count = collections.withLocation.filter((m) => m.location === location).length
                          return (
                            <div
                              key={location}
                              className="flex justify-between items-center p-2 rounded-md hover:bg-accent"
                            >
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-primary" />
                                <span>{location}</span>
                              </div>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/memories">View All Locations</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="p-4 sm:p-6 flex flex-col gap-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Calendar className="h-5 w-5" />
                    This Month's Memories
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {collections.thisMonth.length} memories from this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {collections.thisMonth.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No memories from this month</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {collections.thisMonth.slice(0, 5).map((memory) => (
                        <Link href={`/memory/${memory.id}`} key={memory.id}>
                          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent">
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                              {getMemoryTypeIcon(memory.type)}
                            </div>
                            <div>
                              <p className="font-medium">{memory.title}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(memory.date), "MMM d")}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/timeline">View Timeline</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="highlights">
            <Card>
              <CardHeader className="p-4 sm:p-6 flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Star className="h-5 w-5 text-amber-500" />
                  Memory Highlights
                </CardTitle>
                <CardDescription className="text-sm">Special memories worth revisiting</CardDescription>
              </CardHeader>
              <CardContent>
                {collections.highlights.length === 0 ? (
                  <EmptyState
                    title="No highlights yet"
                    description="Add more memories or mark them as favorites to see highlights"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {collections.highlights.map((memory) => (
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
                                </div>
                              ) : (
                                <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                  {getMemoryTypeIcon(memory.type)}
                                </div>
                              )}
                              <div className="flex-1 space-y-1">
                                <h4 className="font-medium">{memory.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(memory.date), "MMMM d, yyyy")}
                                </p>
                                {memory.isLiked && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Heart className="h-3 w-3 mr-1 fill-current" />
                                    Favorite
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

