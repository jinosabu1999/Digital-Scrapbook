"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Plus, Heart, TimerIcon as Timeline } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/memories", icon: BookOpen, label: "Memories" },
  { href: "/upload", icon: Plus, label: "Add", special: true },
  { href: "/favorites", icon: Heart, label: "Favorites" },
  { href: "/timeline", icon: Timeline, label: "Timeline" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px]",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted",
                item.special && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              <Icon className={cn("h-5 w-5", item.special && "text-primary-foreground")} />
              <span className={cn("text-xs mt-1 font-medium", item.special && "text-primary-foreground")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
