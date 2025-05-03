"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  Image,
  Calendar,
  Search,
  PlusCircle,
  Menu,
  BookOpen,
  Map,
  Tag,
  Clock,
  Sparkles,
  Settings,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

export function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // After mounting, we can render the menu
  useEffect(() => {
    setMounted(true)
  }, [])

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="h-5 w-5" />,
      active: pathname === "/",
    },
    {
      href: "/memories",
      label: "Memories",
      icon: <Image className="h-5 w-5" />,
      active: pathname === "/memories" || pathname.startsWith("/memory/"),
    },
    {
      href: "/upload",
      label: "Add",
      icon: <PlusCircle className="h-6 w-6" />,
      active: pathname === "/upload",
      isAction: true,
    },
    {
      href: "/albums",
      label: "Albums",
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname === "/albums" || pathname.startsWith("/album/"),
    },
    {
      href: "/search",
      label: "Search",
      icon: <Search className="h-5 w-5" />,
      active: pathname === "/search",
    },
  ]

  const sidebarRoutes = [
    {
      href: "/timeline",
      label: "Timeline",
      icon: <Calendar className="h-5 w-5" />,
      active: pathname === "/timeline",
    },
    {
      href: "/memory-map",
      label: "Memory Map",
      icon: <Map className="h-5 w-5" />,
      active: pathname === "/memory-map",
    },
    {
      href: "/tags-explorer",
      label: "Tags",
      icon: <Tag className="h-5 w-5" />,
      active: pathname === "/tags-explorer",
    },
    {
      href: "/this-day",
      label: "This Day",
      icon: <Clock className="h-5 w-5" />,
      active: pathname === "/this-day",
    },
    {
      href: "/smart-collections",
      label: "Collections",
      icon: <Sparkles className="h-5 w-5" />,
      active: pathname === "/smart-collections",
    },
    {
      href: "/settings/offline",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      active: pathname === "/settings/offline",
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0 sm:max-w-xs">
                  <div className="px-7">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                      <span className="font-bold text-xl">Digital Scrapbook</span>
                    </Link>
                  </div>
                  <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
                    <div className="px-7 py-2">
                      <div className="flex flex-col gap-1">
                        {sidebarRoutes.map((route) => (
                          <Link
                            key={route.href}
                            href={route.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                              route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                            )}
                          >
                            {route.icon}
                            {route.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
              <Link href="/" className="flex items-center gap-2">
                <span className="font-bold text-xl">Digital Scrapbook</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {sidebarRoutes.slice(0, 3).map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    route.active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - visible on all screen sizes */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
        <div className="grid grid-cols-5 h-16">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                route.active ? "text-primary" : "text-muted-foreground hover:text-primary",
                route.isAction && "relative -top-4",
              )}
            >
              <div
                className={cn(
                  route.isAction
                    ? "flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg"
                    : "",
                )}
              >
                {route.icon}
              </div>
              <span className={route.isAction ? "mt-1" : ""}>{route.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

