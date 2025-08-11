"use client"

import { useState } from "react"
import { useMemories } from "@/context/memory-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Download,
  Upload,
  Cloud,
  HardDrive,
  FileJson,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BackupPage() {
  const { memories } = useMemories()
  const { toast } = useToast()
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState("weekly")
  const [includeMedia, setIncludeMedia] = useState(true)
  const [exportFormat, setExportFormat] = useState("json")

  const exportFormats = [
    { value: "json", label: "JSON", description: "Complete data with metadata", icon: FileJson },
    { value: "csv", label: "CSV", description: "Spreadsheet format", icon: FileText },
    { value: "html", label: "HTML", description: "Web page format", icon: FileText },
    { value: "pdf", label: "PDF", description: "Printable document", icon: FileText },
  ]

  const handleExport = async (format: string) => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Create export data based on format
      let exportData: string
      let filename: string
      let mimeType: string

      switch (format) {
        case "json":
          exportData = JSON.stringify(
            {
              exportDate: new Date().toISOString(),
              totalMemories: memories.length,
              memories: memories.map((memory) => ({
                ...memory,
                // Include media URLs if requested
                mediaIncluded: includeMedia,
              })),
            },
            null,
            2,
          )
          filename = `memories-backup-${new Date().toISOString().split("T")[0]}.json`
          mimeType = "application/json"
          break

        case "csv":
          const csvHeaders = "Title,Description,Date,Type,Mood,Tags\n"
          const csvRows = memories
            .map(
              (memory) =>
                `"${memory.title}","${memory.description || ""}","${memory.createdAt}","${memory.type}","${memory.mood || ""}","${memory.tags?.join(";") || ""}"`,
            )
            .join("\n")
          exportData = csvHeaders + csvRows
          filename = `memories-export-${new Date().toISOString().split("T")[0]}.csv`
          mimeType = "text/csv"
          break

        case "html":
          exportData = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>My Digital Scrapbook</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .memory { border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 8px; }
                .title { font-size: 1.5em; font-weight: bold; margin-bottom: 10px; }
                .meta { color: #666; font-size: 0.9em; margin-bottom: 10px; }
                .description { line-height: 1.6; }
                .tags { margin-top: 10px; }
                .tag { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; margin-right: 5px; font-size: 0.8em; }
              </style>
            </head>
            <body>
              <h1>My Digital Scrapbook</h1>
              <p>Exported on ${new Date().toLocaleDateString()}</p>
              <p>Total memories: ${memories.length}</p>
              ${memories
                .map(
                  (memory) => `
                <div class="memory">
                  <div class="title">${memory.title}</div>
                  <div class="meta">
                    ${new Date(memory.createdAt).toLocaleDateString()} • ${memory.type}
                    ${memory.mood ? ` • ${memory.mood}` : ""}
                  </div>
                  ${memory.description ? `<div class="description">${memory.description}</div>` : ""}
                  ${
                    memory.tags?.length
                      ? `
                    <div class="tags">
                      ${memory.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
                    </div>
                  `
                      : ""
                  }
                </div>
              `,
                )
                .join("")}
            </body>
            </html>
          `
          filename = `memories-scrapbook-${new Date().toISOString().split("T")[0]}.html`
          mimeType = "text/html"
          break

        default:
          throw new Error("Unsupported format")
      }

      // Create and download file
      const blob = new Blob([exportData], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Complete!",
        description: `Your memories have been exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your memories",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const calculateBackupSize = () => {
    const baseSize = memories.length * 2 // Approximate KB per memory
    const mediaSize = includeMedia ? memories.length * 500 : 0 // Approximate KB per media file
    return ((baseSize + mediaSize) / 1024).toFixed(1) // Convert to MB
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <Download className="mr-2 h-8 w-8 text-purple-500" />
            Backup & Export
          </h1>
          <p className="text-muted-foreground">
            Keep your memories safe with automated backups and flexible export options
          </p>
        </div>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList>
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="backup">Auto Backup</TabsTrigger>
          <TabsTrigger value="restore">Import/Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Your Memories</CardTitle>
                  <CardDescription>Download your memories in various formats for backup or sharing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exportFormats.map((format) => {
                      const Icon = format.icon
                      return (
                        <Card key={format.value} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-center mb-3">
                              <Icon className="mr-3 h-6 w-6 text-blue-500" />
                              <div>
                                <h3 className="font-semibold">{format.label}</h3>
                                <p className="text-sm text-muted-foreground">{format.description}</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleExport(format.value)}
                              disabled={isExporting}
                              className="w-full"
                              variant={exportFormat === format.value ? "default" : "outline"}
                            >
                              {isExporting && exportFormat === format.value ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Exporting...
                                </>
                              ) : (
                                <>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export as {format.label}
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {isExporting && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Exporting memories...</span>
                        <span>{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Export Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-media">Include Media Files</Label>
                    <Switch id="include-media" checked={includeMedia} onCheckedChange={setIncludeMedia} />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Memories:</span>
                      <span className="font-semibold">{memories.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Estimated Size:</span>
                      <span className="font-semibold">{calculateBackupSize()} MB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Data Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      All exports are processed locally
                    </div>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      No data sent to external servers
                    </div>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete data ownership
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cloud className="mr-2 h-6 w-6" />
                Automated Backup Settings
              </CardTitle>
              <CardDescription>Configure automatic backups to keep your memories safe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-backup" className="text-base">
                    Enable Auto Backup
                  </Label>
                  <p className="text-sm text-muted-foreground">Automatically backup your memories</p>
                </div>
                <Switch id="auto-backup" checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>

              {autoBackup && (
                <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                  <div>
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <h3 className="font-semibold">Last Backup</h3>
                        <p className="text-sm text-muted-foreground">2 days ago</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <HardDrive className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <h3 className="font-semibold">Storage Used</h3>
                        <p className="text-sm text-muted-foreground">45.2 MB</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <h3 className="font-semibold">Status</h3>
                        <p className="text-sm text-green-600">Active</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-6 w-6" />
                Import & Restore
              </CardTitle>
              <CardDescription>Import memories from backup files or other sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Import Backup File</h3>
                <p className="text-muted-foreground mb-4">Drag and drop your backup file here, or click to browse</p>
                <Button>Choose File</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-3">
                      <FileJson className="mr-3 h-6 w-6 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">JSON Backup</h3>
                        <p className="text-sm text-muted-foreground">Complete data restore</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports full memory data including metadata, tags, and settings
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-3">
                      <FileText className="mr-3 h-6 w-6 text-green-500" />
                      <div>
                        <h3 className="font-semibold">CSV Import</h3>
                        <p className="text-sm text-muted-foreground">Basic data import</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Import basic memory information from spreadsheet files
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Important Notes</h4>
                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                      <li>• Importing will merge with existing memories</li>
                      <li>• Duplicate memories will be skipped</li>
                      <li>• Large imports may take several minutes</li>
                      <li>• Always backup current data before importing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
