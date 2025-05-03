"use client"

import { useMemories } from "@/context/memory-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CalendarClock, Lock, Unlock } from "lucide-react"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { EmptyState } from "@/components/empty-state"

export function TimeCapsules() {
  const { memories } = useMemories()

  // Filter memories that are time capsules
  const timeCapsules = memories.filter((memory) => memory.isTimeCapsule && memory.unlockDate)

  // Sort by unlock date (soonest first)
  const sortedCapsules = [...timeCapsules].sort((a, b) => {
    if (!a.unlockDate || !b.unlockDate) return 0
    return new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime()
  })

  if (timeCapsules.length === 0) {
    return (
      <EmptyState
        title="No time capsules yet"
        description="Create a time capsule to lock memories until a future date"
      />
    )
  }

  // Calculate progress for each time capsule
  const capsulesWithProgress = sortedCapsules.map((capsule) => {
    const now = new Date()
    const createdDate = new Date(capsule.createdAt)
    const unlockDate = new Date(capsule.unlockDate!)

    const totalDays = differenceInDays(unlockDate, createdDate)
    const daysElapsed = differenceInDays(now, createdDate)

    let progress = Math.round((daysElapsed / totalDays) * 100)

    // Ensure progress is between 0 and 100
    progress = Math.max(0, Math.min(100, progress))

    const isLocked = now < unlockDate

    return {
      ...capsule,
      progress,
      isLocked,
    }
  })

  return (
    <div className="space-y-4">
      {capsulesWithProgress.map((capsule) => (
        <div
          key={capsule.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg"
        >
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2 rounded-full">
              {capsule.isLocked ? (
                <Lock className="h-5 w-5 text-primary" />
              ) : (
                <Unlock className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <h4 className="font-medium">{capsule.title}</h4>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <CalendarClock className="h-3.5 w-3.5 mr-1" />
                <span>
                  Created: {format(new Date(capsule.createdAt), "MMM d, yyyy")} • Unlocks:{" "}
                  {format(new Date(capsule.unlockDate!), "MMM d, yyyy")}
                </span>
              </div>
              <div className="mt-2 w-full max-w-xs">
                <Progress value={capsule.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {capsule.isLocked ? `${100 - capsule.progress}% of time remaining until unlock` : "Ready to open!"}
                </p>
              </div>
            </div>
          </div>
          <Button variant={capsule.isLocked ? "outline" : "default"} size="sm" className="mt-4 sm:mt-0" asChild>
            <Link href={`/memory/${capsule.id}`}>{capsule.isLocked ? "View Details" : "Open Capsule"}</Link>
          </Button>
        </div>
      ))}
    </div>
  )
}

