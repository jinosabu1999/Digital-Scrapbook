import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Star, FolderHeart, WifiOff, Plus } from "lucide-react"
import Link from "next/link"
import { useMemories } from "@/context/memory-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export function FeaturesShowcase() {
  const { memories } = useMemories()
  const hasMemories = memories.length > 0

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">New Features</h2>

      {!hasMemories && (
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Create your first memory</AlertTitle>
          <AlertDescription>
            These features will be available after you create at least one memory. Start by adding your first memory!
            <div className="mt-2">
              <Button asChild size="sm">
                <Link href="/upload">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Memory
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={`overflow-hidden ${!hasMemories ? "opacity-70" : ""}`}>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              This Day in History
            </CardTitle>
            <CardDescription className="text-blue-100">Rediscover memories from this day in the past</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              See what happened on this day throughout your history. Navigate through different days to rediscover
              special moments from your past.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" disabled={!hasMemories}>
              <Link href={hasMemories ? "/this-day" : "#"}>View This Day</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className={`overflow-hidden ${!hasMemories ? "opacity-70" : ""}`}>
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Smart Collections
            </CardTitle>
            <CardDescription className="text-purple-100">Automatically organized memories</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Smart Collections automatically organize your memories based on various criteria like time, favorites,
              media type, and more.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" disabled={!hasMemories}>
              <Link href={hasMemories ? "/smart-collections" : "#"}>View Collections</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className={`overflow-hidden ${!hasMemories ? "opacity-70" : ""}`}>
          <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <FolderHeart className="h-5 w-5" />
              Smart Albums
            </CardTitle>
            <CardDescription className="text-amber-100">
              Create dynamic albums that update automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Create albums that automatically update based on tags, dates, or locations. Perfect for ongoing
              collections like "Family", "Vacations", or "Work".
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" disabled={!hasMemories}>
              <Link href={hasMemories ? "/albums/create" : "#"}>Create Album</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="h-5 w-5" />
              Offline Mode
            </CardTitle>
            <CardDescription className="text-green-100">Access your memories even without internet</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              View and create memories even when you're offline. Changes sync automatically when you reconnect to the
              internet.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/settings/offline">Configure</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

