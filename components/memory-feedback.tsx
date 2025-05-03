import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface MemoryFeedbackProps {
  status: "idle" | "loading" | "success" | "error"
  message?: string
}

export function MemoryFeedback({ status, message }: MemoryFeedbackProps) {
  if (status === "idle") {
    return null
  }

  if (status === "loading") {
    return (
      <Alert className="bg-muted border-muted-foreground/20">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <AlertTitle>Processing</AlertTitle>
        <AlertDescription>{message || "Your memory is being saved..."}</AlertDescription>
      </Alert>
    )
  }

  if (status === "success") {
    return (
      <Alert className="bg-success/10 border-success text-success">
        <CheckCircle2 className="h-4 w-4 mr-2" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>{message || "Your memory has been saved successfully!"}</AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{message || "There was an error saving your memory. Please try again."}</AlertDescription>
      </Alert>
    )
  }

  return null
}

