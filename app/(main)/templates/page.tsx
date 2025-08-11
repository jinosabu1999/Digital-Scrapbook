"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Heart, Plane, Camera, Users, Star, Coffee, Sparkles, ArrowRight } from "lucide-react"

interface MemoryTemplate {
  id: string
  title: string
  description: string
  category: string
  icon: any
  color: string
  prompts: string[]
  tags: string[]
  estimatedTime: string
  difficulty: "Easy" | "Medium" | "Advanced"
}

const templates: MemoryTemplate[] = [
  {
    id: "daily-gratitude",
    title: "Daily Gratitude",
    description: "Capture three things you're grateful for each day",
    category: "wellness",
    icon: Heart,
    color: "text-pink-500",
    prompts: ["What made you smile today?", "Who are you grateful for and why?", "What small moment brought you joy?"],
    tags: ["gratitude", "daily", "wellness"],
    estimatedTime: "5 minutes",
    difficulty: "Easy",
  },
  {
    id: "travel-adventure",
    title: "Travel Adventure",
    description: "Document your travels with guided prompts",
    category: "travel",
    icon: Plane,
    color: "text-blue-500",
    prompts: [
      "What was the highlight of today's journey?",
      "Describe a local food you tried",
      "What surprised you most about this place?",
      "Who did you meet and what did you learn from them?",
    ],
    tags: ["travel", "adventure", "exploration"],
    estimatedTime: "15 minutes",
    difficulty: "Medium",
  },
  {
    id: "family-moments",
    title: "Family Moments",
    description: "Preserve precious family memories and stories",
    category: "family",
    icon: Users,
    color: "text-green-500",
    prompts: [
      "What family tradition means the most to you?",
      "Share a funny story from today",
      "What did you learn from a family member?",
      "Describe a perfect family moment",
    ],
    tags: ["family", "relationships", "traditions"],
    estimatedTime: "10 minutes",
    difficulty: "Easy",
  },
  {
    id: "creative-project",
    title: "Creative Project",
    description: "Document your creative process and inspiration",
    category: "creativity",
    icon: Camera,
    color: "text-purple-500",
    prompts: [
      "What inspired this project?",
      "Describe your creative process",
      "What challenges did you overcome?",
      "How do you feel about the final result?",
    ],
    tags: ["creativity", "art", "inspiration"],
    estimatedTime: "20 minutes",
    difficulty: "Advanced",
  },
  {
    id: "milestone-celebration",
    title: "Milestone Celebration",
    description: "Commemorate important life achievements",
    category: "achievements",
    icon: Star,
    color: "text-yellow-500",
    prompts: [
      "What milestone are you celebrating?",
      "How did you achieve this goal?",
      "Who supported you along the way?",
      "What does this achievement mean to you?",
      "What's your next goal?",
    ],
    tags: ["achievement", "goals", "celebration"],
    estimatedTime: "25 minutes",
    difficulty: "Medium",
  },
  {
    id: "quiet-moments",
    title: "Quiet Moments",
    description: "Reflect on peaceful, contemplative experiences",
    category: "mindfulness",
    icon: Coffee,
    color: "text-amber-500",
    prompts: [
      "Describe this peaceful moment",
      "What thoughts came to mind?",
      "How did this quiet time affect you?",
      "What did you notice around you?",
    ],
    tags: ["mindfulness", "peace", "reflection"],
    estimatedTime: "8 minutes",
    difficulty: "Easy",
  },
]

const categories = [
  { id: "all", label: "All Templates", icon: FileText },
  { id: "wellness", label: "Wellness", icon: Heart },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "family", label: "Family", icon: Users },
  { id: "creativity", label: "Creativity", icon: Camera },
  { id: "achievements", label: "Achievements", icon: Star },
  { id: "mindfulness", label: "Mindfulness", icon: Coffee },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("all")

  const applyTemplate = (template: MemoryTemplate) => {
    // Store template data in localStorage for the upload page to use
    localStorage.setItem("selectedTemplate", JSON.stringify(template))
    router.push("/upload?template=true")
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-50"
      case "Medium":
        return "text-yellow-600 bg-yellow-50"
      case "Advanced":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const filteredTemplates =
    selectedCategory === "all" ? templates : templates.filter((template) => template.category === selectedCategory)

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <FileText className="mr-2 h-8 w-8 text-green-500" />
            Memory Templates
          </h1>
          <p className="text-muted-foreground">Guided prompts to help you capture meaningful memories</p>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center">
                <Icon className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            {filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                  <p className="text-muted-foreground text-center">Try selecting a different category</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => {
                  const Icon = template.icon
                  return (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <Icon className={`mr-3 h-6 w-6 ${template.color}`} />
                            <div>
                              <CardTitle className="text-lg">{template.title}</CardTitle>
                              <CardDescription className="mt-1">{template.description}</CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{template.estimatedTime}</span>
                          <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 flex items-center">
                            <Sparkles className="mr-1 h-4 w-4" />
                            Guided Prompts
                          </h4>
                          <ul className="space-y-1">
                            {template.prompts.slice(0, 3).map((prompt, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start">
                                <span className="mr-2">•</span>
                                {prompt}
                              </li>
                            ))}
                            {template.prompts.length > 3 && (
                              <li className="text-sm text-muted-foreground">
                                +{template.prompts.length - 3} more prompts
                              </li>
                            )}
                          </ul>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <Button onClick={() => applyTemplate(template)} className="w-full">
                          Use Template
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
