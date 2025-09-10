"use client"

import { useMemo } from "react"
import { useMemories } from "@/context/memory-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { Calendar, TrendingUp, Heart, Smile, Meh } from "lucide-react"
import { format, parseISO, eachMonthOfInterval, subMonths } from "date-fns"

const MOOD_COLORS = {
  happy: "#10B981",
  excited: "#F59E0B",
  peaceful: "#3B82F6",
  nostalgic: "#8B5CF6",
  grateful: "#EC4899",
  adventurous: "#EF4444",
  reflective: "#6B7280",
  content: "#14B8A6",
}

const MOOD_ICONS = {
  happy: Smile,
  excited: TrendingUp,
  peaceful: Heart,
  nostalgic: Calendar,
  grateful: Heart,
  adventurous: TrendingUp,
  reflective: Meh,
  content: Smile,
}

export function MoodAnalytics() {
  const { memories } = useMemories()

  const moodData = useMemo(() => {
    // Analyze mood patterns from memory tags and content
    const moodCounts: Record<string, number> = {}
    const monthlyMoods: Record<string, Record<string, number>> = {}

    memories.forEach((memory) => {
      const date = parseISO(memory.createdAt)
      const monthKey = format(date, "yyyy-MM")

      if (!monthlyMoods[monthKey]) {
        monthlyMoods[monthKey] = {}
      }

      // Analyze tags for mood indicators
      const moodTags = memory.tags.filter((tag) =>
        ["happy", "excited", "peaceful", "nostalgic", "grateful", "adventurous", "reflective", "content"].includes(
          tag.toLowerCase(),
        ),
      )

      if (moodTags.length === 0) {
        // Infer mood from content keywords
        const content = (memory.title + " " + memory.description).toLowerCase()
        if (content.includes("happy") || content.includes("joy") || content.includes("amazing")) {
          moodTags.push("happy")
        } else if (content.includes("excited") || content.includes("awesome") || content.includes("incredible")) {
          moodTags.push("excited")
        } else if (content.includes("peaceful") || content.includes("calm") || content.includes("serene")) {
          moodTags.push("peaceful")
        } else if (content.includes("remember") || content.includes("nostalgic") || content.includes("memories")) {
          moodTags.push("nostalgic")
        } else if (content.includes("grateful") || content.includes("thankful") || content.includes("blessed")) {
          moodTags.push("grateful")
        } else if (content.includes("adventure") || content.includes("explore") || content.includes("journey")) {
          moodTags.push("adventurous")
        } else {
          moodTags.push("content")
        }
      }

      moodTags.forEach((mood) => {
        const moodKey = mood.toLowerCase()
        moodCounts[moodKey] = (moodCounts[moodKey] || 0) + 1
        monthlyMoods[monthKey][moodKey] = (monthlyMoods[monthKey][moodKey] || 0) + 1
      })
    })

    // Create timeline data for the last 6 months
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    })

    const timelineData = last6Months.map((month) => {
      const monthKey = format(month, "yyyy-MM")
      const monthData = monthlyMoods[monthKey] || {}

      return {
        month: format(month, "MMM yyyy"),
        happy: monthData.happy || 0,
        excited: monthData.excited || 0,
        peaceful: monthData.peaceful || 0,
        nostalgic: monthData.nostalgic || 0,
        grateful: monthData.grateful || 0,
        adventurous: monthData.adventurous || 0,
        reflective: monthData.reflective || 0,
        content: monthData.content || 0,
      }
    })

    // Create pie chart data
    const pieData = Object.entries(moodCounts).map(([mood, count]) => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: count,
      color: MOOD_COLORS[mood as keyof typeof MOOD_COLORS] || "#6B7280",
    }))

    return { moodCounts, timelineData, pieData }
  }, [memories])

  const topMoods = Object.entries(moodData.moodCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  const totalMemories = memories.length
  const moodfulMemories = Object.values(moodData.moodCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMemories}</div>
            <p className="text-xs text-muted-foreground">{moodfulMemories} with mood indicators</p>
          </CardContent>
        </Card>

        {topMoods.map(([mood, count], index) => {
          const Icon = MOOD_ICONS[mood as keyof typeof MOOD_ICONS] || Smile
          return (
            <Card key={mood}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Mood #{index + 1}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">{mood.charAt(0).toUpperCase() + mood.slice(1)} memories</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mood Distribution</CardTitle>
            <CardDescription>Overall emotional patterns in your memories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={moodData.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {moodData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mood Trends</CardTitle>
            <CardDescription>How your emotional patterns have evolved over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodData.timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="happy" stroke={MOOD_COLORS.happy} strokeWidth={2} />
                <Line type="monotone" dataKey="excited" stroke={MOOD_COLORS.excited} strokeWidth={2} />
                <Line type="monotone" dataKey="peaceful" stroke={MOOD_COLORS.peaceful} strokeWidth={2} />
                <Line type="monotone" dataKey="nostalgic" stroke={MOOD_COLORS.nostalgic} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Mood Breakdown</CardTitle>
          <CardDescription>Detailed view of emotional patterns by month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={moodData.timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              {Object.entries(MOOD_COLORS).map(([mood, color]) => (
                <Bar key={mood} dataKey={mood} stackId="a" fill={color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mood Insights</CardTitle>
          <CardDescription>Personalized insights based on your memory patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topMoods.length > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Insight
                </Badge>
                <p className="text-sm">
                  Your most common mood is <strong>{topMoods[0][0]}</strong> with {topMoods[0][1]} memories. This
                  suggests you tend to capture {topMoods[0][0]} moments most often.
                </p>
              </div>
            )}

            {moodData.timelineData.length > 1 && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Trend
                </Badge>
                <p className="text-sm">
                  You've been consistently creating memories over the past 6 months, showing a healthy pattern of
                  capturing life's moments.
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Recommendation
              </Badge>
              <p className="text-sm">
                Try adding mood-related tags to your memories to get even more detailed insights about your emotional
                journey over time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
