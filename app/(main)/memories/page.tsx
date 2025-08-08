"use client"

import { useState, useEffect } from "react"
import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/empty-state"
import { MoodBadge } from "@/components/mood-selector" // Corrected import
import { Heart, Search, Filter, Calendar, Tag, Image, Video, FileText, Mic, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import type { Memory } from "@/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export default function MemoriesPage() {
  const { memories = [], toggleLike, deleteMemory, loading } = useMemories()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [isDeleting, setIsDeleting] = useState(false)

  // Ensure memories is always an array
  const safeMemories = Array.isArray(memories) ? memories : []

  const filteredMemories = safeMemories.filter((memory: Memory) => {
    // Ensure memory object and its properties are not null/undefined
    if (!memory || !memory.title || !memory.type) return false
    
    const matchesSearch = searchTerm === "" || 
      (memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (memory.description && memory.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (memory.tags && memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))))
    
    const matchesType = filterType === "all" || memory.type === filterType
    
    return matchesSearch && matchesType
  })

  const sortedMemories = [...filteredMemories].sort((a: Memory, b: Memory) => {
    if (!a.createdAt || !b.createdAt) return 0
    
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "title":
        return (a.title || "").localeCompare(b.title || "")
      default:
        return 0
    }
  })

  const getTypeIcon = (type: string) => {
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
        return <FileText className="h-4 w-4" />
    }
  }

  const handleDelete = async (memoryId: string) => {
    setIsDeleting(true)
    try {
      await deleteMemory(memoryId)
      toast({
        title: "Memory Deleted",
        description: "The memory has been permanently deleted.",
      })
    } catch (error) {
      console.error("Failed to delete memory:", error)
      toast({
        title: "Error",
        description: "Failed to delete memory. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
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

  if (safeMemories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Memories</h1>
          <Link href="/upload">
            <Button>Add Memory</Button>
          </Link>
        </div>
        <EmptyState
          title="No memories yet"
          description="Start capturing your precious moments by adding your first memory."
          actionLabel="Add Memory"
          actionHref="/upload"
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Memories</h1>
        <Link href="/upload">
          <Button>Add Memory</Button>
        </Link>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="photo">Photos</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="text">Text</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {sortedMemories.length} of {safeMemories.length} memories
        </p>
      </div>

      {/* Memories Grid */}
      {sortedMemories.length === 0 ? (
        <EmptyState
          title="No memories found"
          description="Try adjusting your search or filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm("")
            setFilterType("all")
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMemories.map((memory: Memory) => (
            <Card key={memory.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(memory.type)}
                    <CardTitle className="text-lg line-clamp-1">
                      {memory.title || "Untitled Memory"}
                    </CardTitle>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigating to detail page
                        toggleLike(memory.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          memory.isLiked 
                            ? "fill-red-500 text-red-500" 
                            : "text-muted-foreground"
                        }`} 
                      />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/memory/${memory.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing immediately
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                memory and remove its data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(memory.id)}
                                disabled={isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {memory.mediaUrl && memory.type === "photo" && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={memory.mediaUrl || "/placeholder.svg"}
                      alt={memory.title || "Memory"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {memory.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {memory.description}
                  </p>
                )}
                
                {memory.mood && (
                  <MoodBadge mood={memory.mood} />
                )}
                
                {memory.tags && memory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {memory.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {memory.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{memory.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>
                    {memory.createdAt 
                      ? formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })
                      : "Unknown date"
                    }
                  </span>
                  <Link 
                    href={`/memory/${memory.id}`}
                    className="text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
