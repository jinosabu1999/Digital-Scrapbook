"use client"

import { Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useMemories } from "@/context/memory-context"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  memoryId: string
  isLiked?: boolean
  className?: string
}

export function FavoriteButton({ memoryId, isLiked, className }: FavoriteButtonProps) {
  const { toggleMemoryLike } = useMemories()

  const handleToggle = () => {
    toggleMemoryLike(memoryId)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={cn("h-8 w-8 p-0", className)}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
        )}
      />
      <span className="sr-only">{isLiked ? "Remove from favorites" : "Add to favorites"}</span>
    </Button>
  )
}
