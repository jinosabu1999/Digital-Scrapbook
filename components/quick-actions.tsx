"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Home, ImageIcon, BookOpen, Search, Upload, Calendar, MapPin, Tag, BarChart3, Keyboard } from "lucide-react"

interface QuickAction {
  id: string
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  shortcut?: string
  category: "navigation" | "actions" | "tools"
}

export function QuickActions() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const actions: QuickAction[] = [
    // Navigation
    {
      id: "home",
      title: "Go to Home",
      description: "Navigate to dashboard",
      icon: Home,
      action: () => router.push("/"),
      shortcut: "⌘H",
      category: "navigation",
    },
    {
      id: "memories",
      title: "View Memories",
      description: "Browse all memories",
      icon: ImageIcon,
      action: () => router.push("/memories"),
      shortcut: "⌘M",
      category: "navigation",
    },
    {
      id: "albums",
      title: "View Albums",
      description: "Browse photo albums",
      icon: BookOpen,
      action: () => router.push("/albums"),
      shortcut: "⌘A",
      category: "navigation",
    },
    {
      id: "search",
      title: "Search",
      description: "Search memories and albums",
      icon: Search,
      action: () => router.push("/search"),
      shortcut: "⌘S",
      category: "navigation",
    },
    {
      id: "timeline",
      title: "Timeline View",
      description: "View memories chronologically",
      icon: Calendar,
      action: () => router.push("/timeline"),
      shortcut: "⌘T",
      category: "navigation",
    },
    {
      id: "stats",
      title: "Statistics",
      description: "View memory statistics",
      icon: BarChart3,
      action: () => router.push("/stats"),
      shortcut: "⌘D",
      category: "navigation",
    },
    // Actions
    {
      id: "upload",
      title: "Upload Memory",
      description: "Add new photos, videos, or notes",
      icon: Upload,
      action: () => router.push("/upload"),
      shortcut: "⌘U",
      category: "actions",
    },
    {
      id: "create-album",
      title: "Create Album",
      description: "Create a new photo album",
      icon: BookOpen,
      action: () => router.push("/albums/create"),
      shortcut: "⌘N",
      category: "actions",
    },
    {
      id: "bulk-import",
      title: "Bulk Import",
      description: "Import multiple files at once",
      icon: Upload,
      action: () => router.push("/bulk-import"),
      shortcut: "⌘B",
      category: "actions",
    },
    // Tools
    {
      id: "tags-explorer",
      title: "Tags Explorer",
      description: "Explore memories by tags",
      icon: Tag,
      action: () => router.push("/tags-explorer"),
      category: "tools",
    },
    {
      id: "memory-map",
      title: "Memory Map",
      description: "View memories on a map",
      icon: MapPin,
      action: () => router.push("/memory-map"),
      category: "tools",
    },
    {
      id: "this-day",
      title: "This Day in History",
      description: "See memories from this day in previous years",
      icon: Calendar,
      action: () => router.push("/this-day"),
      category: "tools",
    },
  ]

  const navigationActions = actions.filter((a) => a.category === "navigation")
  const actionItems = actions.filter((a) => a.category === "actions")
  const toolItems = actions.filter((a) => a.category === "tools")

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }

      // Individual shortcuts
      if (e.metaKey || e.ctrlKey) {
        const action = actions.find((a) => a.shortcut === `⌘${e.key.toUpperCase()}`)
        if (action && !open) {
          e.preventDefault()
          action.action()
        }
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open])

  const runCommand = (action: QuickAction) => {
    setOpen(false)
    action.action()
  }

  return (
    <>
      {/* Trigger Button - Fixed positioning */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-4 z-40 shadow-lg border-2 bg-background/95 backdrop-blur-sm"
      >
        <Keyboard className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Quick Actions</span>
        <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {navigationActions.map((action) => (
              <CommandItem key={action.id} onSelect={() => runCommand(action)} className="flex items-center gap-2">
                <action.icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{action.title}</div>
                  {action.description && <div className="text-xs text-muted-foreground">{action.description}</div>}
                </div>
                {action.shortcut && (
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {action.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            {actionItems.map((action) => (
              <CommandItem key={action.id} onSelect={() => runCommand(action)} className="flex items-center gap-2">
                <action.icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{action.title}</div>
                  {action.description && <div className="text-xs text-muted-foreground">{action.description}</div>}
                </div>
                {action.shortcut && (
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {action.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Tools">
            {toolItems.map((action) => (
              <CommandItem key={action.id} onSelect={() => runCommand(action)} className="flex items-center gap-2">
                <action.icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{action.title}</div>
                  {action.description && <div className="text-xs text-muted-foreground">{action.description}</div>}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
