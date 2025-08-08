"use client"

import { useState, useEffect } from "react"

export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(true)
  const [waitingServiceWorker, setWaitingServiceWorker] = useState<ServiceWorker | null>(null)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [serviceWorkerSupported, setServiceWorkerSupported] = useState(false)

  useEffect(() => {
    try {
      // Initial online status
      setIsOnline(navigator.onLine)

      // Listen for online/offline events
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)

      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)

      // Check if service workers are supported and can be registered
      const checkServiceWorkerSupport = async () => {
        if ("serviceWorker" in navigator) {
          try {
            // Try to register the service worker
            const registration = await navigator.serviceWorker
              .register("/service-worker.js", {
                scope: "/",
              })
              .catch((error) => {
                console.warn("Service worker registration failed:", error)
                return null
              })

            if (registration) {
              setServiceWorkerSupported(true)

              // Check if there's a waiting service worker
              if (registration.waiting) {
                setWaitingServiceWorker(registration.waiting)
                setIsUpdateAvailable(true)
              }

              // Listen for new service workers
              registration.addEventListener("updatefound", () => {
                const newWorker = registration.installing
                if (newWorker) {
                  newWorker.addEventListener("statechange", () => {
                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                      setWaitingServiceWorker(newWorker)
                      setIsUpdateAvailable(true)
                    }
                  })
                }
              })

              // Listen for controller changes
              navigator.serviceWorker.addEventListener("controllerchange", () => {
                window.location.reload()
              })
            }
          } catch (error) {
            console.warn("Service worker registration failed:", error)
            setServiceWorkerSupported(false)
          }
        } else {
          setServiceWorkerSupported(false)
        }
      }

      // Don't try to register service worker in development
      if (process.env.NODE_ENV !== "development") {
        checkServiceWorkerSupport()
      } else {
        console.log("Service worker registration skipped in development")
      }

      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    } catch (error) {
      console.warn("Error in useServiceWorker:", error)
      return () => {}
    }
  }, [])

  // Function to update the service worker
  const updateServiceWorker = () => {
    if (waitingServiceWorker) {
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" })
    }
  }

  return { isOnline, isUpdateAvailable, updateServiceWorker, serviceWorkerSupported }
}
