import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { MemoryProvider } from "@/context/memory-context"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

// Replace the dynamic import with the import of the wrapper component
import { OfflineStatusWrapper } from "@/components/offline-status-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Digital Scrapbook",
  description: "Store and revisit your cherished memories",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MemoryProvider>
            <Suspense fallback={<div>Loading...</div>}>
              {children}
            </Suspense>
            <Toaster />
            <Suspense fallback={null}>
              <OfflineStatusWrapper />
            </Suspense>
            <Analytics />
          </MemoryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
