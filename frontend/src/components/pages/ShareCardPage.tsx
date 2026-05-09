import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ShareCard } from "@/components/organisms"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"

function ShareCardPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const shareData = {
    shareUrl: "https://girl-finance.com/share/abc123",
    ogImageUrl: undefined,
    message: "¡Acabo de ahorrar 50% de mi meta! 🎉",
    progressPercent: 50,
    goalName: "Fondo de emergencia",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base to-surface p-4 space-y-6">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold text-foreground">Compartir</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/dashboard")}
        >
          ← Volver
        </Button>
      </header>

      <div className="max-w-md mx-auto">
        <ShareCard {...shareData} />
      </div>
    </div>
  )
}

export { ShareCardPage }
