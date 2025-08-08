"use client"

import { useState } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentMemories } from "@/components/recent-memories"
import { Plus, Heart, Clock, TrendingUp, Calendar, MapPin } from 'lucide-react'
import Link from "next/link"
import { format, isAfter } from "date-fns"
import { EmptyState } from "@/components/empty-state"

export default function HomePage() {
  const { memories, getFavoriteMemories, loading } = useMemories()
  const [activeTab, setActiveTab] = useState("recent")

  const favoriteMemories = getFavoriteMemories()
  const timeCapsules = memories.filter(memory => memory.isTimeCapsule && memory.unlockDate && isAfter(memory.unlockDate, new Date()))

  const stats = {
    totalMemories: memories.length,
    favoriteMemories: favoriteMemories.length,
    timeCapsules: timeCapsules.length,
    thisWeek: memories.filter(memory => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(memory.createdAt) > weekAgo
    }).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your memories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your digital scrapbook</p>
        </div>
        <Button asChild size="lg" className="shadow-lg">
          <Link href="/upload">
            <Plus className="h-5 w-5 mr-2" />
            Add Memory
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMemories}</p>
                <p className="text-xs text-muted-foreground">Total Memories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Heart className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.favoriteMemories}</p>
                <p className="text-xs text-muted-foreground">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.timeCapsules}</p>
                <p className="text-xs text-muted-foreground">Time Capsules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="timecapsules">Time Capsules</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Memories</CardTitle>
              <CardDescription>Your latest captured moments</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentMemories />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Memories</CardTitle>
              <CardDescription>Your most cherished moments</CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteMemories.length === 0 ? (
                <EmptyState
                  title="No favorite memories yet"
                  description="Heart some memories to see them here"
                  icon={<Heart className="h-12 w-12 text-muted-foreground" />}
                />
              ) : (
                <div className="space-y-4">
                  {favoriteMemories.slice(0, 3).map((memory) => (
                    <Link href={`/memory/${memory.id}`} key={memory.id}>
                      <Card className="hover:bg-accent/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            {memory.mediaUrl ? (
                              <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                <img
                                  src={memory.mediaUrl || "/placeholder.svg"}
                                  alt={memory.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                <Heart className="h-6 w-6 text-red-500 fill-current" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium">{memory.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(memory.date), "MMMM d, yyyy")}
                              </p>
                              {memory.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {memory.location}
                                </p>
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

        <TabsContent value="timecapsules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Capsules</CardTitle>
              <CardDescription>Memories waiting to be unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              {timeCapsules.length === 0 ? (
                <EmptyState
                  title="No time capsules yet"
                  description="Create memories with future unlock dates to see them here"
                  icon={<Clock className="h-12 w-12 text-muted-foreground" />}
                />
              ) : (
                <div className="space-y-4">
                  {timeCapsules.slice(0, 3).map((memory) => (
                    <Card key={memory.id} className="border-dashed">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                            <Clock className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{memory.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Unlocks on {memory.unlockDate && format(new Date(memory.unlockDate), "MMMM d, yyyy")}
                            </p>
                            {memory.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {memory.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used tools and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/upload">
                <Plus className="h-8 w-8" />
                <span>Add Memory</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/favorites">
                <Heart className="h-8 w-8" />
                <span>Favorites</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
