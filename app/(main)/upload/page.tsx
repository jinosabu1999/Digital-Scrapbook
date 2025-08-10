"use client"

import { useRouter } from "next/router"
import { Button } from "@chakra-ui/react"
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
    <div>
      <Button variant="outline" onClick={() => router.back()} disabled={isSaving}>
        Cancel
      </Button>
      {/* Form fields here */}
      <Button colorScheme="blue" onClick={handleSaveMemory} isLoading={isSaving}>
        Save Memory
      </Button>
    </div>
  )
}

export default UploadPage
