import * as React from "react"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/lib/toast"

export interface ShareCardProps {
  shareUrl: string
  ogImageUrl?: string
  message?: string
  progressPercent: number
  goalName: string
}

function ShareCard({ shareUrl, ogImageUrl, message, progressPercent, goalName }: ShareCardProps) {
  const { addToast } = useToast()
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      addToast({
        message: "¡Link copiado!",
        type: "success",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      addToast({
        message: "Error al copiar",
        type: "destructive",
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi meta de ahorro",
          text: message || `¡Acabo de ahorrar ${progressPercent}% de mi meta!`,
          url: shareUrl,
        })
      } catch {
        // User cancelled
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="w-full bg-gradient-to-br from-primary to-pop rounded-2xl p-6 text-white shadow-xl">
      <div className="text-center space-y-4">
        <div className="text-5xl mb-2">🎉</div>
        
        <h2 className="text-2xl font-bold">
          {goalName}
        </h2>
        
        <div className="text-6xl font-black">
          {Math.round(progressPercent)}%
        </div>
        
        {message && (
          <p className="text-lg opacity-90">
            {message}
          </p>
        )}

        {ogImageUrl && (
          <img
            src={ogImageUrl}
            alt="Share card"
            className="w-full rounded-lg shadow-lg"
          />
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleShare}
            variant="secondary"
            className="flex-1"
          >
            📤 Compartir
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1"
          >
            {copied ? "¡Copiado!" : "📋 Copiar link"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { ShareCard }
