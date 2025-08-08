"use client"

import { useState, useEffect } from "react"
import { useServiceWorker } from "@/hooks/use-service-worker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wifi, WifiOff, Database, RefreshCw, Trash, HardDrive, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OfflineSettingsPage() {
  const { isOnline, isUpdateAvailable, updateServiceWorker, serviceWorkerSupported } = useServiceWorker()
  const { toast } = useToast()
  const [offlineEnabled, setOfflineEnabled] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [backgroundSyncEnabled, setBackgroundSyncEnabled] = useState(true)
  const [cacheImagesEnabled, setCacheImagesEnabled] = useState(true)
  const [cacheVideosEnabled, setCacheVideosEnabled] = useState(true)
  const [storageLimit, setStorageLimit] = useState("500mb")
  const [storageUsage, setStorageUsage] = useState(0)
  const [storageQuota, setStorageQuota] = useState(0)
  const [pendingChanges, setPendingChanges] = useState(0)
  const [isClearing, setIsClearing] = useState(false)
  const [storageSupported, setStorageSupported] = useState(false)

  useEffect(() => {
    // Check if storage API is supported
    if (navigator.storage && navigator.storage.estimate) {
      setStorageSupported(true)

      // Get storage usage information
      navigator.storage
        .estimate()
        .then((estimate) => {
          setStorageUsage(estimate.usage || 0)
          setStorageQuota(estimate.quota || 0)
        })
        .catch((error) => {
          console.warn("Error estimating storage:", error)
        })
    }

    // Simulate pending changes
    setPendingChanges(Math.floor(Math.random() * 5))
  }, [])

  const handleClearCache = async () => {
    setIsClearing(true)
    try {
      // Simulate clearing cache
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Cache cleared",
        description: "All cached data has been cleared successfully.",
        variant: "success",
      })

      setStorageUsage(0)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cache. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  const handleSyncNow = () => {
    toast({
      title: "Sync started",
      description: "Synchronizing your data with the server...",
    })

    // Simulate sync
    setTimeout(() => {
      setPendingChanges(0)
      toast({
        title: "Sync complete",
        description: "All your data has been synchronized.",
        variant: "success",
      })
    }, 2000)
  }

  const handleToggleOfflineMode = (checked: boolean) => {
    setOfflineEnabled(checked)
    toast({
      title: checked ? "Offline Mode Enabled" : "Offline Mode Disabled",
      description: checked
        ? "Your data will be available when offline."
        : "Your data will only be available when online.",
    })
  }

  const handleToggleAutoSync = (checked: boolean) => {
    setAutoSync(checked)
    toast({
      title: checked ? "Auto Sync Enabled" : "Auto Sync Disabled",
      description: checked
        ? "Changes will automatically sync when you're online."
        : "You'll need to manually sync changes.",
    })
  }

  const handleToggleNotifications = (checked: boolean) => {
    setNotificationsEnabled(checked)
    toast({
      title: checked ? "Notifications Enabled" : "Notifications Disabled",
      description: checked
        ? "You'll be notified about connection changes."
        : "You won't receive connection notifications.",
    })
  }

  const handleToggleBackgroundSync = (checked: boolean) => {
    setBackgroundSyncEnabled(checked)
    toast({
      title: checked ? "Background Sync Enabled" : "Background Sync Disabled",
      description: checked
        ? "Changes will sync even when the app is closed."
        : "Changes will only sync when the app is open.",
    })
  }

  const handleToggleCacheImages = (checked: boolean) => {
    setCacheImagesEnabled(checked)
    toast({
      title: checked ? "Image Caching Enabled" : "Image Caching Disabled",
      description: checked ? "Images will be available offline." : "Images will only be available online.",
    })
  }

  const handleToggleCacheVideos = (checked: boolean) => {
    setCacheVideosEnabled(checked)
    toast({
      title: checked ? "Video Caching Enabled" : "Video Caching Disabled",
      description: checked ? "Videos will be available offline." : "Videos will only be available online.",
    })
  }

  const handleStorageLimitChange = (value: string) => {
    setStorageLimit(value)
    toast({
      title: "Storage Limit Updated",
      description: `Storage limit set to ${value}.`,
    })
  }

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your offline settings have been saved successfully.",
      variant: "success",
    })
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Offline Settings</h1>

      {!serviceWorkerSupported && (
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limited Offline Support</AlertTitle>
          <AlertDescription>
            Full offline functionality is not available in this environment. Some features may be limited or
            unavailable.
            <br />
            <span className="text-sm opacity-80">
              Note: You can still adjust settings for when offline support is available.
            </span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className={`mr-2 h-3 w-3 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
              Connection Status
            </CardTitle>
            <CardDescription>{isOnline ? "You are currently online" : "You are currently offline"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-primary/10">
                  {isOnline ? (
                    <Wifi className="h-5 w-5 text-primary" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{isOnline ? "Online Mode" : "Offline Mode"}</p>
                  <p className="text-sm text-muted-foreground">
                    {isOnline
                      ? "Changes are saved to the server in real-time"
                      : "Changes are saved locally and will sync when you reconnect"}
                  </p>
                </div>
              </div>
            </div>

            {!isOnline && pendingChanges > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  You have {pendingChanges} pending {pendingChanges === 1 ? "change" : "changes"} that will sync when
                  you reconnect.
                </p>
              </div>
            )}

            {isUpdateAvailable && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 flex justify-between items-center">
                <p className="text-sm text-blue-800 dark:text-blue-300">A new version of the app is available.</p>
                <Button size="sm" onClick={updateServiceWorker}>
                  Update Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Storage Usage
            </CardTitle>
            <CardDescription>Manage your offline storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {storageSupported ? (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Used: {formatBytes(storageUsage)}</span>
                    <span className="text-sm text-muted-foreground">Available: {formatBytes(storageQuota)}</span>
                  </div>
                  <Progress value={(storageUsage / storageQuota) * 100} />
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full" onClick={handleClearCache} disabled={isClearing}>
                    {isClearing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash className="mr-2 h-4 w-4" />
                        Clear Cache
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Storage information is not available in this environment.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Offline Configuration</CardTitle>
            <CardDescription>Configure how the app behaves when offline</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general">
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="sync">Synchronization</TabsTrigger>
                <TabsTrigger value="storage">Storage</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="offline-mode">Enable Offline Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow the app to work without an internet connection
                    </p>
                  </div>
                  <Switch id="offline-mode" checked={offlineEnabled} onCheckedChange={handleToggleOfflineMode} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="offline-notifications">Offline Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show notifications when you go offline or come back online
                    </p>
                  </div>
                  <Switch
                    id="offline-notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={handleToggleNotifications}
                  />
                </div>

                {!serviceWorkerSupported && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 mt-4">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Full offline functionality requires service worker support, which is not available in this
                      environment. Your settings will be saved and applied when using a supported browser or
                      environment.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sync" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-sync">Auto Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync changes when you come back online
                    </p>
                  </div>
                  <Switch id="auto-sync" checked={autoSync} onCheckedChange={handleToggleAutoSync} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="background-sync">Background Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync changes in the background even when the app is closed
                    </p>
                  </div>
                  <Switch
                    id="background-sync"
                    checked={backgroundSyncEnabled}
                    onCheckedChange={handleToggleBackgroundSync}
                  />
                </div>

                <Button onClick={handleSyncNow} disabled={!isOnline || pendingChanges === 0} className="mt-2">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Now ({pendingChanges})
                </Button>
              </TabsContent>

              <TabsContent value="storage" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cache-images">Cache Images</Label>
                    <p className="text-sm text-muted-foreground">Store images locally for offline viewing</p>
                  </div>
                  <Switch id="cache-images" checked={cacheImagesEnabled} onCheckedChange={handleToggleCacheImages} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cache-videos">Cache Videos</Label>
                    <p className="text-sm text-muted-foreground">Store videos locally for offline viewing</p>
                  </div>
                  <Switch id="cache-videos" checked={cacheVideosEnabled} onCheckedChange={handleToggleCacheVideos} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="storage-limit">Storage Limit</Label>
                    <p className="text-sm text-muted-foreground">Set a maximum storage limit for offline content</p>
                  </div>
                  <Select value={storageLimit} onValueChange={handleStorageLimitChange}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100mb">100 MB</SelectItem>
                      <SelectItem value="500mb">500 MB</SelectItem>
                      <SelectItem value="1gb">1 GB</SelectItem>
                      <SelectItem value="5gb">5 GB</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full" onClick={handleClearCache}>
                    <HardDrive className="mr-2 h-4 w-4" />
                    Manage Storage
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto" onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
