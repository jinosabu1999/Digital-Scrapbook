"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import the OfflineStatus component with no SSR
const OfflineStatusComponent = dynamic(
  () =>
    import("@/components/offline-status")
      .then((mod) => mod.OfflineStatus)
      .catch(() => {
        // Return a fallback component if import fails
        return () => null
      }),
  { ssr: false },
)

export function OfflineStatusWrapper() {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState(false)
  const [showNotification, setShowNotification] = useState(false) // Default to not showing

  useEffect(() => {
    try {
      setMounted(true)

      // Check if we should show notifications based on user preference
      // For now, we'll default to not showing them
      const shouldShowNotifications = localStorage.getItem("showOfflineNotifications") === "true"
      setShowNotification(shouldShowNotifications)
    } catch (e) {
      setError(true)
      console.warn("Error mounting OfflineStatusWrapper:", e)
    }
  }, [])

  if (!mounted || error || !showNotification) {
    return null
  }

  return <OfflineStatusComponent />
}

