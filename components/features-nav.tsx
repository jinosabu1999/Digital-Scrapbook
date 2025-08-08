"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export function FeaturesNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Sparkles className="h-4 w-4" />
          <span>Features</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/collages">Memory Collages</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/books">Memory Books</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mashups">Memory Mashups</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/offline">Offline Settings</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
