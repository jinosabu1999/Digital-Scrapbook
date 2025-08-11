"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Camera, Clock, Heart } from "lucide-react"

export const MobileNav = () => {
  const pathname = usePathname()

  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Memories",
      href: "/memories",
      icon: Camera,
    },
    {
      name: "Timeline",
      href: "/timeline",
      icon: Clock,
    },
    {
      name: "Favorites",
      href: "/favorites",
      icon: Heart,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around px-2 py-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNav
