"use client"

import { useState, useEffect } from "react"
import { useMemories } from "@/context/memory-context"
import { AIInsightsService, type MemoryInsight } from "@/lib/ai-insights"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, TrendingUp, Target, Lightbulb, Sparkles, RefreshCw, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function InsightsPage() {
  const { memories } = useMemories()
  const router = useRouter()
  const [insights, setInsights] = useState<MemoryInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    generateInsights()
  }, [memories])

  const generateInsights = async () => {
    setLoading(true)
    try {
      const newInsights = await AIInsightsService.generateInsights(memories)
      setInsights(newInsights)
    } catch (error) {
      console.error("Error generating insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshInsights = async () => {
    setAnalyzing(true)
    await generateInsights()
    setAnalyzing(false)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pattern":
        return <TrendingUp className="h-5 w-5 text-blue-500" />
      case "suggestion":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />
      case "milestone":
        return <Target className="h-5 w-5 text-green-500" />
      case "connection":
        return <Sparkles className="h-5 w-5 text-purple-500" />
      default:
        return <Brain className="h-5 w-5" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "pattern":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30"
      case "suggestion":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30"
      case "milestone":
        return "border-l-green-500 bg-green-50 dark:bg-green-950/30"
      case "connection":
        return "border-l-purple-500 bg-purple-50 dark:bg-purple-950/30"
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-950/30"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <Brain className="mr-2 h-8 w-8 text-blue-500" />
            AI Memory Insights
          </h1>
          <p className="text-muted-foreground">
            Discover patterns, connections, and insights from your memory collection
          </p>
        </div>
        <Button onClick={handleRefreshInsights} disabled={analyzing} variant="outline">
          {analyzing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
          {analyzing ? "Analyzing..." : "Refresh Insights"}
        </Button>
      </div>

      {memories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Memories to Analyze</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start adding memories to get AI-powered insights about your patterns and trends!
            </p>
            <Button onClick={() => router.push("/upload")}>Add Your First Memory</Button>
          </CardContent>
        </Card>
      ) : insights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Building Your Insights</h3>
            <p className="text-muted-foreground text-center">
              Keep adding memories! We need a few more data points to generate meaningful insights.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Insights ({insights.length})</TabsTrigger>
            <TabsTrigger value="patterns">Patterns ({insights.filter((i) => i.type === "pattern").length})</TabsTrigger>
            <TabsTrigger value="milestones">
              Milestones ({insights.filter((i) => i.type === "milestone").length})
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              Suggestions ({insights.filter((i) => i.type === "suggestion").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className={`border-l-4 ${getInsightColor(insight.type)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription className="mt-1">{insight.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(insight.confidence * 100)}% confident
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {insight.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                {insight.relatedMemoryIds.length > 0 && (
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {insight.relatedMemoryIds.length} related memories
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Navigate to memories filtered by these IDs
                          const searchParams = new URLSearchParams()
                          searchParams.set("ids", insight.relatedMemoryIds.join(","))
                          router.push(`/memories?${searchParams.toString()}`)
                        }}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View Memories
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>

          {(["patterns", "milestones", "suggestions"] as const).map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              {insights
                .filter((i) => i.type === type)
                .map((insight) => (
                  <Card key={insight.id} className={`border-l-4 ${getInsightColor(insight.type)}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getInsightIcon(insight.type)}
                          <div>
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <CardDescription className="mt-1">{insight.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confident
                        </Badge>
                      </div>
                    </CardHeader>
                    {insight.relatedMemoryIds.length > 0 && (
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {insight.relatedMemoryIds.length} related memories
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const searchParams = new URLSearchParams()
                              searchParams.set("ids", insight.relatedMemoryIds.join(","))
                              router.push(`/memories?${searchParams.toString()}`)
                            }}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View Memories
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
