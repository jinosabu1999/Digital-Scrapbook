"use server"

import { revalidatePath } from "next/cache"
import type { MemoryType } from "@/context/memory-context"

export interface MemoryData {
  title: string
  description?: string
  date: Date | undefined
  location?: string
  tags: string[]
  type: MemoryType
  content: string | null // For text memories
  mediaUrl?: string // For uploaded media
  isTimeCapsule: boolean
  unlockDate?: Date
}

export async function saveMemory(data: MemoryData): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    // Validate required fields
    if (!data.title) {
      return { success: false, message: "Title is required" }
    }

    if (!data.date) {
      return { success: false, message: "Date is required" }
    }

    if (data.isTimeCapsule && !data.unlockDate) {
      return { success: false, message: "Unlock date is required for time capsules" }
    }

    // In a real application, you would save this data to a database
    // For now, we'll simulate a successful save with a delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate a random ID for the new memory
    const id = Math.random().toString(36).substring(2, 15)

    // Revalidate the paths that display memories
    revalidatePath("/")
    revalidatePath("/memories")
    revalidatePath("/timeline")

    return {
      success: true,
      message: "Memory saved successfully!",
      id,
    }
  } catch (error) {
    console.error("Error saving memory:", error)
    return {
      success: false,
      message: "An error occurred while saving the memory. Please try again.",
    }
  }
}

