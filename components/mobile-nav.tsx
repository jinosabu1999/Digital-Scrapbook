import React from "react"
import { Search, FileText, Download, FolderOpen, Bell } from "lucide-react"
import { Home, Info, Mail } from "lucide-react"

// Added named export for MobileNav to match import in layout
export const MobileNav = () => {
  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      color: "text-red-500",
    },
    {
      name: "About",
      href: "/about",
      icon: Info,
      color: "text-yellow-500",
    },
    {
      name: "Contact",
      href: "/contact",
      icon: Mail,
      color: "text-pink-500",
    },
    {
      name: "Advanced Search",
      href: "/advanced-search",
      icon: Search,
      color: "text-blue-500",
    },
    {
      name: "Templates",
      href: "/templates",
      icon: FileText,
      color: "text-green-500",
    },
    {
      name: "Backup",
      href: "/backup",
      icon: Download,
      color: "text-purple-500",
    },
    {
      name: "Smart Folders",
      href: "/smart-folders",
      icon: FolderOpen,
      color: "text-orange-500",
    },
    {
      name: "Reminders",
      href: "/reminders",
      icon: Bell,
      color: "text-pink-500",
    },
  ]

  return (
    <nav>
      {navigation.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className={`flex items-center p-2 rounded-lg hover:bg-gray-100 ${item.color}`}
        >
          {React.createElement(item.icon, { className: "w-6 h-6 mr-2" })}
          {item.name}
        </a>
      ))}
    </nav>
  )
}

export default MobileNav
