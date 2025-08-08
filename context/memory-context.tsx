"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import type { MoodType } from "@/components/mood-selector"

export type MemoryType = "photo" | "video" | "audio" | "text"

export interface Memory {
  id: string
  title: string
  description?: string
  date: Date
  location?: string
  tags: string[]
  type: MemoryType
  content?: string
  mediaUrl?: string
  isTimeCapsule: boolean
  unlockDate?: Date
  createdAt: Date
  isLiked?: boolean
  appliedFilter?: string
  mood?: MoodType
}

export interface Album {
  id: string
  title: string
  description?: string
  coverUrl?: string
  memories: string[] // Memory IDs
  createdAt: Date
}

interface MemoryContextType {
  memories: Memory[]
  albums: Album[]
  addMemory: (memory: Omit<Memory, "id" | "createdAt">) => string
  updateMemory: (id: string, memory: Partial<Memory>) => void
  deleteMemory: (id: string) => void
  getMemory: (id: string) => Memory | undefined
  toggleLike: (id: string) => void
  toggleMemoryLike: (id: string) => void
  addAlbum: (album: Omit<Album, "id" | "createdAt">) => string
  updateAlbum: (id: string, album: Partial<Album>) => void
  deleteAlbum: (id: string) => void
  getAlbum: (id: string) => Album | undefined
  addMemoryToAlbum: (memoryId: string, albumId: string) => void
  removeMemoryFromAlbum: (memoryId: string, albumId: string) => void
  applyFilter: (id: string, filter: string | null) => void
  loading: boolean
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined)

export function MemoryProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [memories, setMemories] = useState<Memory[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedMemories = localStorage.getItem("memories")
        const savedAlbums = localStorage.getItem("albums")

        if (savedMemories) {
          const parsedMemories = JSON.parse(savedMemories)
          // Convert string dates back to Date objects
          setMemories(
            parsedMemories.map((memory: any) => ({
              ...memory,
              date: new Date(memory.date),
              unlockDate: memory.unlockDate ? new Date(memory.unlockDate) : undefined,
              createdAt: new Date(memory.createdAt),
            })),
          )
        }

        if (savedAlbums) {
          const parsedAlbums = JSON.parse(savedAlbums)
          setAlbums(
            parsedAlbums.map((album: any) => ({
              ...album,
              createdAt: new Date(album.createdAt),
            })),
          )
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
    }
  }, [memories, albums, loading])

  const addMemory = (memory: Omit<Memory, "id" | "createdAt">) => {
    const id = Math.random().toString(36).substring(2, 15)
    const newMemory: Memory = {
      ...memory,
      id,
      createdAt: new Date(),
      isLiked: false,
    }

    setMemories((prev) => [newMemory, ...prev])
    return id
  }

  const updateMemory = (id: string, memory: Partial<Memory>) => {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, ...memory } : m)))
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
  }

  const getMemory = (id: string) => {
    return memories.find((m) => m.id === id)
  }

  const toggleLike = (id: string) => {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, isLiked: !m.isLiked } : m)))
  }

  const toggleMemoryLike = (id: string) => {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, isLiked: !m.isLiked } : m)))
  }

  const applyFilter = (id: string, filter: string | null) => {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, appliedFilter: filter || undefined } : m)))
  }

  const addAlbum = (album: Omit<Album, "id" | "createdAt">) => {
    const id = Math.random().toString(36).substring(2, 15)
    const newAlbum: Album = {
      ...album,
      id,
      createdAt: new Date(),
    }

    setAlbums((prev) => [newAlbum, ...prev])
    return id
  }

  const updateAlbum = (id: string, album: Partial<Album>) => {
    setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, ...album } : a)))
  }

  const deleteAlbum = (id: string) => {
    setAlbums((prev) => prev.filter((a) => a.id !== id))
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
          }
        }
        return album
      }),
    )
  }

  return (
    <MemoryContext.Provider
      value={{
        memories,
        albums,
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
