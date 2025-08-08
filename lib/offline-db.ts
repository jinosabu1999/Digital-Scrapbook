"use client"

export interface OfflineChange {
  id: string
  type: "add" | "update" | "delete"
  entity: "memory" | "album"
  data: any
  timestamp: number
}

export async function openDB(): Promise<IDBDatabase | null> {
  // Check if IndexedDB is supported
  if (!("indexedDB" in window)) {
    console.warn("IndexedDB is not supported in this browser")
    return null
  }

  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open("chronocapsule-offline", 1)

      request.onupgradeneeded = (event) => {
        const db = request.result

        // Create stores for offline data
        if (!db.objectStoreNames.contains("memories")) {
          db.createObjectStore("memories", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("albums")) {
          db.createObjectStore("albums", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("offlineChanges")) {
          db.createObjectStore("offlineChanges", { keyPath: "id" })
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => {
        console.error("Error opening IndexedDB:", request.error)
        resolve(null)
      }
    } catch (error) {
      console.error("Error opening IndexedDB:", error)
      resolve(null)
    }
  })
}

export async function saveOfflineChange(change: OfflineChange): Promise<boolean> {
  const db = await openDB()
  if (!db) return false

  try {
    const tx = db.transaction("offlineChanges", "readwrite")
    const store = tx.objectStore("offlineChanges")

    await store.put(change)

    // Also update local cache
    if (change.type !== "delete") {
      const entityTx = db.transaction(change.entity + "s", "readwrite")
      const entityStore = entityTx.objectStore(change.entity + "s")
      await entityStore.put(change.data)
    } else if (change.type === "delete") {
      const entityTx = db.transaction(change.entity + "s", "readwrite")
      const entityStore = entityTx.objectStore(change.entity + "s")
      await entityStore.delete(change.data.id)
    }

    // Request sync when online
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register("sync-memories")
      } catch (error) {
        console.warn("Background sync registration failed:", error)
      }
    }

    return true
  } catch (error) {
    console.error("Error saving offline change:", error)
    return false
  }
}

export async function getOfflineData(store: string): Promise<any[]> {
  const db = await openDB()
  if (!db) return []

  try {
    const tx = db.transaction(store, "readonly")
    const objectStore = tx.objectStore(store)

    return objectStore.getAll()
  } catch (error) {
    console.error(`Error getting offline data from ${store}:`, error)
    return []
  }
}
