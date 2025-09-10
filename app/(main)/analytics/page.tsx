import { MoodAnalytics } from "@/components/mood-analytics"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Memory Analytics</h1>
        <p className="text-muted-foreground mt-2">Discover patterns and insights from your digital scrapbook</p>
      </div>

      <MoodAnalytics />
    </div>
  )
}
