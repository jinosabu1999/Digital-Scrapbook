"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Star, Grid, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useMemories } from "@/context/memory-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ExplorePage() {
  const { memories, loading } = useMemories()
  const hasMemories = memories.length > 0

  // Count memories with locations
  const memoriesWithLocation = memories.filter((memory) => memory.location && memory.location.trim() !== "").length

  // Count favorites
  const favoriteMemories = memories.filter((memory) => memory.isLiked).length

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Explore Your Memories</h1>

      {!hasMemories && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No memories yet</AlertTitle>
          <AlertDescription>Add some memories to start exploring them in different ways.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              This Day in History
            </CardTitle>
            <CardDescription>Rediscover memories from this day in the past</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              See what happened on this day throughout your history. Navigate through different days to rediscover
              special moments from your past.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" disabled={!hasMemories}>
              <Link href="/this-day">
                <Calendar className="h-4 w-4 mr-2" />
                View This Day
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-600/10">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              Smart Collections
            </CardTitle>
            <CardDescription>Automatically organized memories</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Smart Collections automatically organize your memories based on various criteria like time, favorites,
              media type, and more.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" disabled={!hasMemories}>
              <Link href="/smart-collections">
                <Star className="h-4 w-4 mr-2" />
                View Collections
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-amber-500/10 to-amber-600/10">
            <CardTitle className="flex items-center gap-2">
              <Grid className="h-5 w-5 text-amber-600" />
              Collages
            </CardTitle>
            <CardDescription>Create visual collages from your photos</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Combine multiple photos into beautiful collages with various layouts and styles. Perfect for creating
              visual stories and sharing on social media.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" disabled={!hasMemories}>
              <Link href="/collages">
                <Grid className="h-4 w-4 mr-2" />
                Create Collage
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Memory Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memories.filter((m) => m.type === "photo").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favoriteMemories}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(memories.map((m) => m.location).filter(Boolean)).size}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

