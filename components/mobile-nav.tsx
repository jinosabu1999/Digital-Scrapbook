"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Image, Plus, FolderOpen, Heart, Search } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/memories",
    label: "Memories", 
    icon: Image,
  },
  {
    href: "/upload",
    label: "Add",
    icon: Plus,
    isSpecial: true,
  },
  {
    href: "/albums",
    label: "Albums",
    icon: FolderOpen,
  },
  {
    href: "/favorites",
    label: "Favorites",
    icon: Heart,
  },
  {
    href: "/search",
    label: "Search",
    icon: Search,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.isSpecial) {
            return (
              <Button
                key={item.href}
                asChild
                size="icon"
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg"
              >
                <Link href={item.href}>
                  <Icon className="h-6 w-6" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </Button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNav
