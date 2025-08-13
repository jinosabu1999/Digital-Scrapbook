import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { MemoryProvider } from "@/context/memory-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Digital Scrapbook",
  description: "Capture and organize your precious memories",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MemoryProvider>
            {children}
            <Toaster />
          </MemoryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
