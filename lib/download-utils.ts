export async function downloadFile(url: string, filename: string): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false

    const response = await fetch(url)

    if (!response.ok) {
      console.error("Failed to fetch file:", response.status, response.statusText)
      return false
    }

    const blob = await response.blob()

    // Check for msSaveBlob function (for IE and Edge)
    if (typeof (window as any).navigator.msSaveBlob === "function") {
      ;(window as any).navigator.msSaveBlob(blob, filename)
    } else {
      // Create a temporary link element
      const link = document.createElement("a")
      link.href = window.URL.createObjectURL(blob)
      link.download = filename

      // Append to the document
      document.body.appendChild(link)
      link.click()

      // Clean it up afterwards
      document.body.removeChild(link)
    }

    return true
  } catch (error) {
    console.error("Error downloading file:", error)
    return false
  }
}

export function applyImageFilter(imageElement: HTMLImageElement, filter: string): string {
  if (typeof document === "undefined") {
    throw new Error("Document not available in SSR context")
  }

  // Create a canvas to apply the filter
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  // Set canvas dimensions to match the image
  canvas.width = imageElement.naturalWidth
  canvas.height = imageElement.naturalHeight

  // Draw the original image
  ctx.drawImage(imageElement, 0, 0)

  // Apply the filter
  switch (filter) {
    case "sepia":
      ctx.filter = "sepia(100%)"
      break
    case "grayscale":
      ctx.filter = "grayscale(100%)"
      break
    case "saturate":
      ctx.filter = "saturate(150%)"
      break
    case "contrast":
      ctx.filter = "contrast(125%)"
      break
    case "brightness":
      ctx.filter = "brightness(110%) contrast(75%)"
      break
    default:
      ctx.filter = "none"
  }

  // Draw the filtered image
  ctx.drawImage(imageElement, 0, 0)

  // Return the data URL
  return canvas.toDataURL("image/jpeg", 0.9)
}

export function cropImage(
  imageElement: HTMLImageElement,
  aspectRatio: string,
  x = 0,
  y = 0,
  width?: number,
  height?: number,
): string {
  if (typeof document === "undefined") {
    throw new Error("Document not available in SSR context")
  }

  // Create a canvas to crop the image
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  // Calculate dimensions based on aspect ratio if not provided
  if (!width || !height) {
    const imgWidth = imageElement.naturalWidth
    const imgHeight = imageElement.naturalHeight

    // Parse aspect ratio
    let ratioWidth = 1
    let ratioHeight = 1

    if (aspectRatio) {
      const [w, h] = aspectRatio.split(":").map(Number)
      ratioWidth = w
      ratioHeight = h
    }

    // Calculate the crop dimensions
    if (imgWidth / imgHeight > ratioWidth / ratioHeight) {
      // Image is wider than the target ratio
      height = imgHeight
      width = height * (ratioWidth / ratioHeight)
      x = (imgWidth - width) / 2
      y = 0
    } else {
      // Image is taller than the target ratio
      width = imgWidth
      height = width * (ratioHeight / ratioWidth)
      x = 0
      y = (imgHeight - height) / 2
    }
  }

  // Set canvas dimensions to the crop size
  canvas.width = width
  canvas.height = height

  // Draw the cropped image
  ctx.drawImage(
    imageElement,
    x,
    y,
    width,
    height, // Source rectangle
    0,
    0,
    width,
    height, // Destination rectangle
  )

  // Return the data URL
  return canvas.toDataURL("image/jpeg", 0.9)
}

export function addStickerToImage(
  imageElement: HTMLImageElement,
  stickerUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Document not available in SSR context"))
      return
    }

    // Create a canvas
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    // Set canvas dimensions to match the image
    canvas.width = imageElement.naturalWidth
    canvas.height = imageElement.naturalHeight

    // Draw the original image
    ctx.drawImage(imageElement, 0, 0)

    // Load the sticker
    const sticker = document.createElement("img")
    sticker.crossOrigin = "anonymous"
    sticker.onload = () => {
      // Draw the sticker at the specified position and size
      ctx.drawImage(sticker, x, y, width, height)

      // Return the data URL
      resolve(canvas.toDataURL("image/jpeg", 0.9))
    }
    sticker.onerror = () => {
      reject(new Error("Failed to load sticker"))
    }
    sticker.src = stickerUrl
  })
}
