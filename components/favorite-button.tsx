"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from 'lucide-react'
import { useMemories } from "@/context/memory-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  memoryId: string
  isLiked?: boolean
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "ghost"
}

export function FavoriteButton({ 
  memoryId, 
  isLiked = false, 
  className, 
  size = "default",
  variant = "outline"
}: FavoriteButtonProps) {
  const { toggleMemoryLike } = useMemories()
  const { toast } = useToast()
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async () => {
    if (isToggling) return
    
    setIsToggling(true)
    
    try {
      toggleMemoryLike(memoryId)
      
      toast({
        title: isLiked ? "Removed from favorites" : "Added to favorites",
        description: isLiked 
          ? "Memory removed from your favorites" 
          : "Memory added to your favorites",
      })
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isToggling}
      className={cn(
        "transition-colors",
        isLiked && "text-red-500 hover:text-red-600",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4",
          size === "sm" && "h-3 w-3",
          size === "lg" && "h-5 w-5",
          isLiked && "fill-current"
        )} 
      />
      <span className="sr-only">
        {isLiked ? "Remove from favorites" : "Add to favorites"}
      </span>
    </Button>
  )
}

export default FavoriteButton
