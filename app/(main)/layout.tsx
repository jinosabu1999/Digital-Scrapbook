import type React from "react"
import { MobileNav } from "@/components/mobile-nav"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <MobileNav />
      <main className="flex-1 overflow-auto pb-20">
        <div className="max-w-full">{children}</div>
      </main>
    </div>
  )
}

