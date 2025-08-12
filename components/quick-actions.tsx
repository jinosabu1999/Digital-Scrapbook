"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Keyboard, Plus, Search, Heart, BarChart3, Home, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemories } from "@/context/memory-context"

export function QuickActions() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { memories } = useMemories()

  const handleCommand = (command: string) => {
    setOpen(false)
    router.push(command)
  }

  useEffect(() => {
    if (typeof document === "undefined") return

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-24 right-4 z-40 shadow-lg bg-background/95 backdrop-blur md:hidden"
        onClick={() => setOpen(true)}
      >
        <Keyboard className="h-4 w-4 mr-2" />
        <span className="text-xs">⌘K</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleCommand("/")}>
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("/memories")}>
              <ImageIcon className="mr-2 h-4 w-4" />
              <span>All Memories</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("/favorites")}>
              <Heart className="mr-2 h-4 w-4" />
              <span>Favorites</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("/stats")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Statistics</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => handleCommand("/upload")}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Memory</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("/search")}>
              <Search className="mr-2 h-4 w-4" />
              <span>Search Memories</span>
            </CommandItem>
          </CommandGroup>
          {memories.length > 0 && (
            <CommandGroup heading="Recent Memories">
              {memories.slice(0, 5).map((memory) => (
                <CommandItem key={memory.id} onSelect={() => handleCommand(`/memory/${memory.id}`)}>
                  <span>{memory.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
