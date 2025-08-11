"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const UploadPage = () => {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveMemory = async () => {
    setIsSaving(true)
    // Save memory logic here
    setIsSaving(false)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.back()} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSaveMemory} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Memory"}
        </Button>
      </div>
      {/* Form fields here */}
    </div>
  )
}

export default UploadPage
