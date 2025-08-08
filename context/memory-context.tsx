"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Memory, Album, Tag, MemoryType, MoodType } from "@/types"

interface MemoryContextType {
  memories: Memory[]
  albums: Album[]
  tags: Tag[]
  addMemory: (memory: Omit<Memory, "id" | "createdAt" | "updatedAt">) => string
  updateMemory: (id: string, memory: Partial<Memory>) => void
  deleteMemory: (id: string) => void
  getMemory: (id: string) => Memory | undefined
  toggleLike: (id: string) => void
  toggleMemoryLike: (id: string) => void
  addAlbum: (album: Omit<Album, "id" | "createdAt" | "updatedAt">) => string
  updateAlbum: (id: string, album: Partial<Album>) => void
  deleteAlbum: (id: string) => void
  getAlbum: (id: string) => Album | undefined
  addMemoryToAlbum: (memoryId: string, albumId: string) => void
  removeMemoryFromAlbum: (memoryId: string, albumId: string) => void
  applyFilter: (id: string, filter: string | null) => void
  getFavoriteMemories: () => Memory[]
  searchMemories: (query: string) => Memory[]
  getMemoriesByTag: (tagName: string) => Memory[]
  getMemoriesByDateRange: (startDate: Date, endDate: Date) => Memory[]
  loading: boolean
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined)

export function MemoryProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [memories, setMemories] = useState<Memory[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedMemories = localStorage.getItem("memories")
        const savedAlbums = localStorage.getItem("albums")
        const savedTags = localStorage.getItem("tags")

        if (savedMemories) {
          const parsedMemories = JSON.parse(savedMemories)
          // Convert string dates back to Date objects
          setMemories(
            parsedMemories.map((memory: any) => ({
              ...memory,
              date: new Date(memory.date),
              unlockDate: memory.unlockDate ? new Date(memory.unlockDate) : undefined,
              createdAt: new Date(memory.createdAt),
              updatedAt: new Date(memory.updatedAt),
            })),
          )
        }

        if (savedAlbums) {
          const parsedAlbums = JSON.parse(savedAlbums)
          setAlbums(
            parsedAlbums.map((album: any) => ({
              ...album,
              createdAt: new Date(album.createdAt),
              updatedAt: new Date(album.updatedAt),
            })),
          )
        }

        if (savedTags) {
          setTags(JSON.parse(savedTags))
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load your memories. Please try refreshing the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("memories", JSON.stringify(memories))
      localStorage.setItem("albums", JSON.stringify(albums))
      localStorage.setItem("tags", JSON.stringify(tags))
    }
  }, [memories, albums, tags, loading])

  const addMemory = (memory: Omit<Memory, "id" | "createdAt" | "updatedAt">) => {
    const id = Math.random().toString(36).substring(2, 15)
    const newMemory: Memory = {
      ...memory,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isLiked: false,
    }

    setMemories((prev) => [newMemory, ...prev])

    // Update tags
    if (memory.tags) {
      const newTags = memory.tags.filter(tagName => 
        !tags.some(tag => tag.name === tagName)
      ).map(tagName => ({
        id: Date.now().toString() + Math.random(),
        name: tagName,
        count: 1
      }))
      
      setTags(prev => [
        ...prev.map(tag => 
          memory.tags?.includes(tag.name) 
            ? { ...tag, count: tag.count + 1 }
            : tag
        ),
        ...newTags
      ])
    }

    toast({
      title: "🎉 Memory saved!",
      description: "Your memory has been successfully added to your collection.",
    })

    return id
  }

  const updateMemory = (id: string, memory: Partial<Memory>) => {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, ...memory, updatedAt: new Date() } : m)))
  }

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id))

    // Also remove from any albums
    setAlbums((prev) =>
      prev.map((album) => ({
        ...album,
        memories: album.memories.filter((memoryId) => memoryId !== id),
      })),
    )

    toast({
      title: "Memory deleted",
      description: "The memory has been removed from your collection.",
    })
  }

  const getMemory = (id: string) => {
    return memories.find((m) => m.id === id)
  }

  const toggleLike = (id: string) => {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, isLiked: !m.isLiked, updatedAt: new Date() } : m)))
  }

  const toggleMemoryLike = (id: string) => {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, isLiked: !m.isLiked, updatedAt: new Date() } : m)))
  }

  const applyFilter = (id: string, filter: string | null) => {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, appliedFilter: filter || undefined, updatedAt: new Date() } : m)))
  }

  const addAlbum = (album: Omit<Album, "id" | "createdAt" | "updatedAt">) => {
    const id = Math.random().toString(36).substring(2, 15)
    const newAlbum: Album = {
      ...album,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setAlbums((prev) => [newAlbum, ...prev])

    toast({
      title: "📚 Album created!",
      description: `"${album.title}" has been added to your collection.`,
    })

    return id
  }

  const updateAlbum = (id: string, album: Partial<Album>) => {
    setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, ...album, updatedAt: new Date() } : a)))
  }

  const deleteAlbum = (id: string) => {
    setAlbums((prev) => prev.filter((a) => a.id !== id))
    
    toast({
      title: "Album deleted",
      description: "The album has been removed from your collection.",
    })
  }

  const getAlbum = (id: string) => {
    return albums.find((a) => a.id === id)
  }

  const addMemoryToAlbum = (memoryId: string, albumId: string) => {
    setAlbums((prev) =>
      prev.map((album) => {
        if (album.id === albumId && !album.memories.includes(memoryId)) {
          return {
            ...album,
            memories: [...album.memories, memoryId],
            updatedAt: new Date(),
          }
        }
        return album
      }),
    )
  }

  const removeMemoryFromAlbum = (memoryId: string, albumId: string) => {
    setAlbums((prev) =>
      prev.map((album) => {
        if (album.id === albumId) {
          return {
            ...album,
            memories: album.memories.filter((id) => id !== memoryId),
            updatedAt: new Date(),
          }
        }
        return album
      }),
    )
  }

  const getFavoriteMemories = () => {
    return memories.filter(memory => memory.isLiked)
  }

  const searchMemories = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return memories.filter(memory => 
      memory.title.toLowerCase().includes(lowercaseQuery) ||
      memory.description?.toLowerCase().includes(lowercaseQuery) ||
      memory.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  const getMemoriesByTag = (tagName: string) => {
    return memories.filter(memory => 
      memory.tags?.includes(tagName)
    )
  }

  const getMemoriesByDateRange = (startDate: Date, endDate: Date) => {
    return memories.filter(memory => {
      const memoryDate = new Date(memory.date)
      return memoryDate >= startDate && memoryDate <= endDate
    })
  }

  return (
    <MemoryContext.Provider
      value={{
        memories,
        albums,
        tags,
        addMemory,
        updateMemory,
        deleteMemory,
        getMemory,
        toggleLike,
        toggleMemoryLike,
        addAlbum,
        updateAlbum,
        deleteAlbum,
        getAlbum,
        addMemoryToAlbum,
        removeMemoryFromAlbum,
        applyFilter,
        getFavoriteMemories,
        searchMemories,
        getMemoriesByTag,
        getMemoriesByDateRange,
        loading,
      }}
    >
      {children}
    </MemoryContext.Provider>
  )
}

export function useMemories() {
  const context = useContext(MemoryContext)
  if (context === undefined) {
    throw new Error("useMemories must be used within a MemoryProvider")
  }
  return context
}

// Also export as useMemory for backward compatibility
export const useMemory = useMemories
