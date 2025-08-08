"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from 'lucide-react'
import Link from "next/link"
import { useMemories } from "@/context/memory-context"
import { RecentMemories } from "@/components/recent-memories"
import { FeaturedAlbums } from "@/components/featured-albums"
import { TimeCapsules } from "@/components/time-capsules"
import { QuickActions } from "@/components/quick-actions"

function DashboardContent() {
  const { memories, albums } = useMemories()

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your digital scrapbook</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/upload">
            <Plus className="mr-2 h-4 w-4" />
            Add Memory
          </Link>
        </Button>
      </div>

      {/* Main Content Tabs - Removed Features tab */}
      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="time-capsules">Time Capsules</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-6">
          <RecentMemories />
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ❤️ Your Favorite Memories
                </CardTitle>
                <CardDescription>
                  Memories you've marked as favorites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentMemories showOnlyFavorites />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time-capsules" className="space-y-6">
          <TimeCapsules />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📸</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memories.length}</div>
            <p className="text-xs text-muted-foreground">
              {memories.filter(m => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(m.createdAt) > weekAgo
              }).length} added this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Albums</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📚</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{albums.length}</div>
            <p className="text-xs text-muted-foreground">
              {albums.filter(a => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(a.createdAt) > weekAgo
              }).length} created this week
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
