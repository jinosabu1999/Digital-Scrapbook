"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Heart, Plus, Clock, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/memories",
    label: "Memories",
    icon: Search,
  },
  {
    href: "/upload",
    label: "Add",
    icon: Plus,
    isSpecial: true,
  },
  {
    href: "/favorites",
    label: "Favorites",
    icon: Heart,
  },
  {
    href: "/timeline",
    label: "Timeline",
    icon: Clock,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.isSpecial) {
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  size="sm"
                  className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg"
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span className={cn(isActive && "text-primary")}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
