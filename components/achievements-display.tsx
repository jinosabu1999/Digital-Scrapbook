"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Lock, Star, Target, Flame, Heart, Palette, MapPin, Tag } from "lucide-react"
import { getRarityBadgeColor } from "@/lib/achievements"
import type { Achievement, AchievementCategory } from "@/types"

interface AchievementsDisplayProps {
  achievements: Achievement[]
  userStats?: {
    totalMemories: number
    favoriteMemories: number
    currentStreak: number
    longestStreak: number
    uniqueLocations: number
    uniqueTags: number
    photosWithEffects: number
    collagesCreated: number
  }
}

const CATEGORY_ICONS = {
  memories: Target,
  streaks: Flame,
  social: Heart,
  creative: Palette,
  explorer: MapPin,
  collector: Tag,
}

const CATEGORY_LABELS = {
  memories: "Memories",
  streaks: "Streaks",
  social: "Social",
  creative: "Creative",
  explorer: "Explorer",
  collector: "Collector",
}

export function AchievementsDisplay({ achievements, userStats }: AchievementsDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | "all">("all")

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked)
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked)

  const filteredAchievements =
    selectedCategory === "all" ? achievements : achievements.filter((a) => a.category === selectedCategory)

  const categories = Object.keys(CATEGORY_LABELS) as AchievementCategory[]

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock rewards as you build your digital scrapbook
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{unlockedAchievements.length}</p>
                <p className="text-xs text-muted-foreground">Unlocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{lockedAchievements.length}</p>
                <p className="text-xs text-muted-foreground">Locked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{userStats?.currentStreak || 0}</p>
                <p className="text-xs text-muted-foreground">Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as AchievementCategory | "all")}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category]
            return (
              <TabsTrigger key={category} value={category} className="flex items-center gap-1">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{CATEGORY_LABELS[category]}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`relative overflow-hidden ${
                  achievement.isUnlocked ? "border-primary/50 bg-primary/5" : "border-muted"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl ${achievement.isUnlocked ? "" : "grayscale opacity-50"}`}>
                        {achievement.icon}
                      </div>
                      <div>
                        <CardTitle className={`text-lg ${achievement.isUnlocked ? "" : "text-muted-foreground"}`}>
                          {achievement.title}
                        </CardTitle>
                        <Badge variant="secondary" className={`text-xs ${getRarityBadgeColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>

                    {achievement.isUnlocked ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className={`text-sm ${achievement.isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                    {achievement.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {Math.min(achievement.progress, achievement.requirement)} / {achievement.requirement}
                      </span>
                    </div>
                    <Progress value={(achievement.progress / achievement.requirement) * 100} className="h-2" />
                  </div>

                  {achievement.unlockedAt && (
                    <p className="text-xs text-muted-foreground">
                      Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                    </p>
                  )}
                </CardContent>

                {achievement.isUnlocked && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-yellow-400" />
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
