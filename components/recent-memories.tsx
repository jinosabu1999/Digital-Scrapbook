"use client"

import { useMemories } from "@/context/memory-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Image, Video, Mic, FileText } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { EmptyState } from "@/components/empty-state"

interface RecentMemoriesProps {
  extended?: boolean
}

export function RecentMemories({ extended = false }: RecentMemoriesProps) {
  const { memories } = useMemories()

  // Sort memories by creation date (newest first)
  const sortedMemories = [...memories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Limit to 5 memories, or all if extended
  const displayMemories = extended ? sortedMemories : sortedMemories.slice(0, 3)

  if (memories.length === 0) {
    return <EmptyState title="No memories yet" description="Add your first memory to see it here" />
  }

  return (
    <div className="space-y-4">
      {displayMemories.map((memory) => (
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
                  <p className="text-sm text-muted-foreground">{format(new Date(memory.date), "MMMM d, yyyy")}</p>
                  {memory.location && <p className="text-sm text-muted-foreground">{memory.location}</p>}
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
  )
}

