"use client"

import { useMemories } from "@/context/memory-context"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, differenceInDays } from "date-fns"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Info } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TooltipProvider, Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function MemoryStats() {
  const { memories } = useMemories()
  const [chartType, setChartType] = useState<"area" | "bar" | "pie" | "insights">("area")
  const [timeRange, setTimeRange] = useState<"6m" | "1y" | "all">("1y")

  // Generate data for the selected time range
  const today = new Date()

  const getStartDate = () => {
    switch (timeRange) {
      case "6m":
        return subMonths(today, 6)
      case "1y":
        return subMonths(today, 12)
      case "all":
        if (memories.length === 0) return subMonths(today, 12)
        const oldestMemory = [...memories].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )[0]
        return new Date(oldestMemory.createdAt)
    }
  }

  const startDate = getStartDate()

  const monthsRange = eachMonthOfInterval({
    start: startOfMonth(startDate),
    end: endOfMonth(today),
  })

  // Prepare data for charts
  const monthlyData = useMemo(() => {
    return monthsRange.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      // Count memories created in this month
      const monthMemories = memories.filter((memory) => {
        const memoryDate = new Date(memory.createdAt)
        return memoryDate >= monthStart && memoryDate <= monthEnd
      })

      // Count by type
      const photoCount = monthMemories.filter((m) => m.type === "photo").length
      const videoCount = monthMemories.filter((m) => m.type === "video").length
      const audioCount = monthMemories.filter((m) => m.type === "audio").length
      const textCount = monthMemories.filter((m) => m.type === "text").length

      return {
        month: format(month, "MMM"),
        monthFull: format(month, "MMMM"),
        year: format(month, "yyyy"),
        total: monthMemories.length,
        photo: photoCount,
        video: videoCount,
        audio: audioCount,
        text: textCount,
      }
    })
  }, [memories, monthsRange])

  // Prepare data for pie chart
  const typeData = useMemo(() => {
    const photoCount = memories.filter((m) => m.type === "photo").length
    const videoCount = memories.filter((m) => m.type === "video").length
    const audioCount = memories.filter((m) => m.type === "audio").length
    const textCount = memories.filter((m) => m.type === "text").length

    return [
      { name: "Photos", value: photoCount, color: "#4dabf7" },
      { name: "Videos", value: videoCount, color: "#ff6b6b" },
      { name: "Audio", value: audioCount, color: "#ffd43b" },
      { name: "Text", value: textCount, color: "#51cf66" },
    ].filter((item) => item.value > 0)
  }, [memories])

  // Prepare data for insights
  const insightsData = useMemo(() => {
    if (memories.length === 0) return null

    // Most active day of week
    const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0] // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    memories.forEach((memory) => {
      const date = new Date(memory.createdAt)
      dayOfWeekCounts[date.getDay()]++
    })

    const maxDayCount = Math.max(...dayOfWeekCounts)
    const mostActiveDayIndex = dayOfWeekCounts.indexOf(maxDayCount)
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const mostActiveDay = dayNames[mostActiveDayIndex]

    // Most used tags
    const tagCounts: Record<string, number> = {}
    memories.forEach((memory) => {
      memory.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ name: tag, value: count }))

    // Memory creation frequency
    const totalDays = differenceInDays(today, new Date(memories[0].createdAt)) || 1
    const frequency = (memories.length / totalDays).toFixed(2)

    // Memory type distribution for radar chart
    const radarData = [
      { subject: "Photos", A: memories.filter((m) => m.type === "photo").length, fullMark: memories.length },
      { subject: "Videos", A: memories.filter((m) => m.type === "video").length, fullMark: memories.length },
      { subject: "Audio", A: memories.filter((m) => m.type === "audio").length, fullMark: memories.length },
      { subject: "Text", A: memories.filter((m) => m.type === "text").length, fullMark: memories.length },
      { subject: "Favorites", A: memories.filter((m) => m.isLiked).length, fullMark: memories.length },
      { subject: "Time Capsules", A: memories.filter((m) => m.isTimeCapsule).length, fullMark: memories.length },
    ]

    // Monthly growth trend
    const monthlyGrowth = []
    let cumulativeCount = 0

    for (const month of monthlyData) {
      cumulativeCount += month.total
      monthlyGrowth.push({
        month: `${month.month} ${month.year}`,
        count: cumulativeCount,
      })
    }

    return {
      mostActiveDay,
      mostActiveDayCount: maxDayCount,
      topTags: sortedTags,
      frequency,
      radarData,
      monthlyGrowth,
    }
  }, [memories, monthlyData, today])

  // Custom tooltip for area chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{`${data.monthFull} ${data.year}`}</p>
          <p className="text-sm text-muted-foreground">{`Total: ${data.total} memories`}</p>
          <div className="mt-2 space-y-1">
            {data.photo > 0 && (
              <p className="text-xs flex items-center">
                <span className="h-2 w-2 rounded-full bg-[#4dabf7] mr-1"></span>
                Photos: {data.photo}
              </p>
            )}
            {data.video > 0 && (
              <p className="text-xs flex items-center">
                <span className="h-2 w-2 rounded-full bg-[#ff6b6b] mr-1"></span>
                Videos: {data.video}
              </p>
            )}
            {data.audio > 0 && (
              <p className="text-xs flex items-center">
                <span className="h-2 w-2 rounded-full bg-[#ffd43b] mr-1"></span>
                Audio: {data.audio}
              </p>
            )}
            {data.text > 0 && (
              <p className="text-xs flex items-center">
                <span className="h-2 w-2 rounded-full bg-[#51cf66] mr-1"></span>
                Text: {data.text}
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Fallback content when no data is available
  const NoDataFallback = () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Add memories to see activity charts</p>
    </div>
  )

  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-xl">Memory Activity</CardTitle>
            <CardDescription>Track your memory creation patterns</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {timeRange === "6m" ? "Last 6 Months" : timeRange === "1y" ? "Last Year" : "All Time"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTimeRange("6m")}>Last 6 Months</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("1y")}>Last Year</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("all")}>All Time</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tabs value={chartType} onValueChange={(v) => setChartType(v as any)} className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="area" className="text-xs px-2 h-6">
                  Area
                </TabsTrigger>
                <TabsTrigger value="bar" className="text-xs px-2 h-6">
                  Bar
                </TabsTrigger>
                <TabsTrigger value="pie" className="text-xs px-2 h-6">
                  Pie
                </TabsTrigger>
                <TabsTrigger value="insights" className="text-xs px-2 h-6">
                  Insights
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] w-full overflow-hidden p-4">
          {memories.length === 0 ? (
            <NoDataFallback />
          ) : (
            <>
              {chartType === "area" && (
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10 }}
                        tickMargin={5}
                        height={30}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        width={25}
                        tickFormatter={(value) => (value === 0 ? "0" : value)}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {chartType === "bar" && (
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10 }}
                        tickMargin={5}
                        height={30}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        width={25}
                        tickFormatter={(value) => (value === 0 ? "0" : value)}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="photo" stackId="a" fill="#4dabf7" />
                      <Bar dataKey="video" stackId="a" fill="#ff6b6b" />
                      <Bar dataKey="audio" stackId="a" fill="#ffd43b" />
                      <Bar dataKey="text" stackId="a" fill="#51cf66" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {chartType === "pie" && (
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        formatter={(value, entry, index) => (
                          <span className="text-xs">
                            {value} ({typeData[index]?.value || 0})
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {chartType === "insights" && insightsData && (
                <div className="h-full w-full overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h3 className="font-medium flex items-center gap-1">
                          Memory Growth
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Cumulative growth of your memories over time</p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        </h3>
                        <div className="h-[120px] mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={insightsData.monthlyGrowth}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                              <XAxis
                                dataKey="month"
                                tick={{ fontSize: 9 }}
                                interval={Math.ceil(insightsData.monthlyGrowth.length / 6)}
                              />
                              <YAxis tick={{ fontSize: 9 }} />
                              <Tooltip />
                              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h3 className="font-medium flex items-center gap-1">
                          Memory Distribution
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Distribution of your memory types and features</p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        </h3>
                        <div className="h-[120px] mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius={50} data={insightsData.radarData}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                              <PolarRadiusAxis angle={30} domain={[0, "auto"]} tick={{ fontSize: 9 }} />
                              <Radar
                                name="Memories"
                                dataKey="A"
                                stroke="hsl(var(--primary))"
                                fill="hsl(var(--primary))"
                                fillOpacity={0.5}
                              />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h3 className="font-medium">Key Insights</h3>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-center justify-between">
                            <span>Most active day:</span>
                            <span className="font-medium">
                              {insightsData.mostActiveDay} ({insightsData.mostActiveDayCount} memories)
                            </span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span>Memory creation rate:</span>
                            <span className="font-medium">{insightsData.frequency} per day</span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span>Total memories:</span>
                            <span className="font-medium">{memories.length}</span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span>Favorite memories:</span>
                            <span className="font-medium">
                              {memories.filter((m) => m.isLiked).length} (
                              {Math.round((memories.filter((m) => m.isLiked).length / memories.length) * 100)}%)
                            </span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span>Time capsules:</span>
                            <span className="font-medium">
                              {memories.filter((m) => m.isTimeCapsule).length} (
                              {Math.round((memories.filter((m) => m.isTimeCapsule).length / memories.length) * 100)}%)
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h3 className="font-medium">Top Tags</h3>
                        {insightsData.topTags.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            {insightsData.topTags.map((tag, index) => (
                              <div key={tag.name} className="flex items-center justify-between">
                                <span className="text-sm">{tag.name}</span>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2 bg-primary/80 rounded-full"
                                    style={{ width: `${Math.min(100, tag.value * 10)}px` }}
                                  ></div>
                                  <span className="text-xs">{tag.value}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-2">No tags found</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

