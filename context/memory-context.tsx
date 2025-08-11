"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Memory, Tag } from "@/types"

export type MemoryType = "photo" | "video" | "audio" | "text"

interface MemoryContextType {
  memories: Memory[]
  tags: Tag[]
  addMemory: (memory: Omit<Memory, "id" | "createdAt" | "updatedAt" | "isLiked">) => string
  updateMemory: (id: string, memory: Partial<Memory>) => void
  deleteMemory: (id: string) => void
  getMemory: (id: string) => Memory | undefined
  toggleLike: (id: string) => void
  toggleMemoryLike: (id: string) => void
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
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedMemories = localStorage.getItem("memories")
        const savedTags = localStorage.getItem("tags")

        if (savedMemories) {
          const parsedMemories = JSON.parse(savedMemories)
          setMemories(
            parsedMemories.map((memory: any) => ({
              ...memory,
              date: new Date(memory.date),
              unlockDate: memory.unlockDate ? new Date(memory.unlockDate) : undefined,
              createdAt: new Date(memory.createdAt),
              updatedAt: new Date(memory.updatedAt),
              tags: memory.tags || [],
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
      localStorage.setItem("tags", JSON.stringify(tags))
    }
  }, [memories, tags, loading])

  const addMemory = (memory: Omit<Memory, "id" | "createdAt" | "updatedAt" | "isLiked">) => {
    const id = Math.random().toString(36).substring(2, 15)
    const newMemory: Memory = {
      ...memory,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isLiked: false,
      tags: memory.tags || [],
    }

    setMemories((prev) => [newMemory, ...prev])

    // Update tags
    if (memory.tags && memory.tags.length > 0) {
      const newTags = memory.tags
        .filter((tagName) => !tags.some((tag) => tag.name === tagName))
        .map((tagName) => ({
          id: Date.now().toString() + Math.random(),
          name: tagName,
          count: 1,
        }))

      setTags((prev) => [
        ...prev.map((tag) => (memory.tags?.includes(tag.name) ? { ...tag, count: tag.count + 1 } : tag)),
        ...newTags,
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

  const getFavoriteMemories = () => {
    return memories.filter((memory) => memory.isLiked)
  }

  const searchMemories = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return memories.filter(
      (memory) =>
        memory.title?.toLowerCase().includes(lowercaseQuery) ||
        memory.description?.toLowerCase().includes(lowercaseQuery) ||
        memory.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
    )
  }

  const getMemoriesByTag = (tagName: string) => {
    return memories.filter((memory) => memory.tags?.includes(tagName))
  }

  const getMemoriesByDateRange = (startDate: Date, endDate: Date) => {
    return memories.filter((memory) => {
      const memoryDate = new Date(memory.date)
      return memoryDate >= startDate && memoryDate <= endDate
    })
  }

  return (
    <MemoryContext.Provider
      value={{
        memories,
        tags,
        addMemory,
        updateMemory,
        deleteMemory,
        getMemory,
        toggleLike,
        toggleMemoryLike,
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

export const useMemory = useMemories
