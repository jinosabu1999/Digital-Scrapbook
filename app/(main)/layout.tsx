import type React from "react"
import { MobileNav } from "@/components/mobile-nav"
import { TopNav } from "@/components/top-nav"
import { QuickActions } from "@/components/quick-actions"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <TopNav />
      <main className="flex-1 overflow-auto pb-20">
        <div className="max-w-full">{children}</div>
      </main>
      <MobileNav />
      <QuickActions />
    </div>
  )
}
