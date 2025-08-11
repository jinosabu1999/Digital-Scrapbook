"use client"

import { useState, useEffect } from "react"
import { AlertCircle, WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if user has set a preference for notifications
    const notificationPreference = localStorage.getItem("showOfflineNotifications")
    // Default to not showing notifications unless explicitly enabled
    setShowNotification(notificationPreference === "true")

    const handleOnline = () => {
      setIsOnline(true)
      if (notificationPreference === "true") {
        toast({
          title: "You're back online",
          description: "Your changes will now sync automatically",
          variant: "success",
        })
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Set initial state
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [toast])

  const toggleNotifications = () => {
    if (typeof window === "undefined") return

    const newValue = !showNotification
    setShowNotification(newValue)
    localStorage.setItem("showOfflineNotifications", newValue.toString())
  }

  if (isOnline || !showNotification) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4">
      <Alert variant="destructive" className="shadow-lg">
        <AlertCircle className="h-4 w-4" />
        <div className="flex-1">
          <AlertTitle className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" /> You're offline
          </AlertTitle>
          <AlertDescription>Your changes will be saved locally and synced when you're back online.</AlertDescription>
        </div>
        <Button variant="outline" size="sm" className="ml-2 bg-background" onClick={toggleNotifications}>
          Hide
        </Button>
      </Alert>
    </div>
  )
}
