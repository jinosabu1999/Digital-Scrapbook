"use client"

import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Loader2, Image, Video, Mic, FileText, SearchIcon, Camera, Book } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "@/components/empty-state"
import { RecentMemories } from "@/components/recent-memories"
import { FeaturedAlbums } from "@/components/featured-albums"
import { TimeCapsules } from "@/components/time-capsules"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { FeaturesShowcase } from "@/components/features-showcase"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { memories, albums, loading } = useMemories()
  const [activeTab, setActiveTab] = useState("overview")

  // Check for tab in URL on initial load
  useEffect(() => {
    // Simple URL parsing to get the tab parameter
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get("tab")

    if (tabParam && ["overview", "recent", "favorites", "time-capsules", "features"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update URL without full page reload
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url)
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

  const hasContent = memories.length > 0 || albums.length > 0

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-[100vw] overflow-hidden">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <Button asChild>
            <Link href="/upload">
              <Plus className="mr-2 h-4 w-4" /> Add Memory
            </Link>
          </Button>
        </div>

        {!hasContent ? (
          <EmptyState
            title="Welcome to your Digital Scrapbook"
            description="Start by adding your first memory to create your personal collection"
            action={
              <Button asChild>
                <Link href="/upload">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Memory
                </Link>
              </Button>
            }
          />
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="w-full overflow-x-auto flex flex-nowrap justify-start md:justify-center">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="time-capsules">Time Capsules</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used tools and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-24 flex flex-col gap-2" asChild>
                      <Link href="/upload">
                        <Camera className="h-6 w-6" />
                        <span>Add Memory</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2" asChild>
                      <Link href="/search">
                        <SearchIcon className="h-6 w-6" />
                        <span>Search</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2" asChild>
                      <Link href="/collages">
                        <Image className="h-6 w-6" />
                        <span>Create Collage</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2" asChild>
                      <Link href="/albums/create">
                        <Book className="h-6 w-6" />
                        <span>Create Album</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Memory Stats */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{memories.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Albums</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{albums.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{memories.filter((m) => m.type === "photo").length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Videos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{memories.filter((m) => m.type === "video").length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Featured Content */}
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>Featured Content</CardTitle>
                  <CardDescription>Highlights from your collection</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {memories
                      .filter((m) => m.isLiked)
                      .slice(0, 3)
                      .map((memory) => (
                        <Link href={`/memory/${memory.id}`} key={memory.id}>
                          <div className="relative aspect-square rounded-md overflow-hidden group">
                            {memory.mediaUrl ? (
                              <img
                                src={memory.mediaUrl || "/placeholder.svg"}
                                alt={memory.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                {memory.type === "photo" && <Image className="h-12 w-12 text-muted-foreground" />}
                                {memory.type === "video" && <Video className="h-12 w-12 text-muted-foreground" />}
                                {memory.type === "audio" && <Mic className="h-12 w-12 text-muted-foreground" />}
                                {memory.type === "text" && <FileText className="h-12 w-12 text-muted-foreground" />}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                              <div className="p-3 text-white">
                                <h3 className="font-medium">{memory.title}</h3>
                                <p className="text-sm">{format(new Date(memory.date), "MMM d, yyyy")}</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/memories">View All Memories</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Advanced Search */}
              <Card className="col-span-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Advanced Search</CardTitle>
                  <SearchIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-2">
                    Find specific memories with our powerful search tools
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/search">
                      <SearchIcon className="mr-2 h-4 w-4" />
                      Search Memories
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-full md:col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Memories</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <RecentMemories />
                  </CardContent>
                </Card>
                <Card className="col-span-full md:col-span-3">
                  <CardHeader>
                    <CardTitle>Albums</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FeaturedAlbums />
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/albums">View All Albums</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="recent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Memories</CardTitle>
                  <CardDescription>Your most recently added memories</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentMemories extended />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="favorites" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Memories</CardTitle>
                  <CardDescription>Memories you've marked as favorites</CardDescription>
                </CardHeader>
                <CardContent>
                  {memories.filter((m) => m.isLiked).length > 0 ? (
                    <div className="space-y-4">
                      {memories
                        .filter((m) => m.isLiked)
                        .map((memory) => (
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
                                        {memory.type === "text" && (
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                        )}
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
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      You haven't marked any memories as favorites yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="time-capsules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Time Capsules</CardTitle>
                  <CardDescription>Memories set to be revealed at a future date</CardDescription>
                </CardHeader>
                <CardContent>
                  <TimeCapsules />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/upload">Create New Time Capsule</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="features" className="space-y-4">
              <FeaturesShowcase />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

