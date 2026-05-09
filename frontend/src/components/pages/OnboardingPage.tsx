import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useToast } from "@/components/ui/Toast"

function OnboardingPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [step, setStep] = React.useState<1 | 2>(1)
  const [pat, setPat] = React.useState("")
  const [patValidating, setPatValidating] = React.useState(false)
  const [patError, setPatError] = React.useState("")
  
  const [goalName, setGoalName] = React.useState("")
  const [targetAmount, setTargetAmount] = React.useState("")
  const [deadline, setDeadline] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const handleValidatePAT = async () => {
    setPatValidating(true)
    setPatError("")

    try {
      // TODO: Implement PAT validation API call
      console.log("Validating PAT:", pat)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStep(2)
      addToast({
        message: "¡Firefly conectado! 🎉",
        type: "success",
      })
    } catch {
      setPatError("PAT inválido. Verifica tu token.")
      addToast({
        message: "Error al conectar Firefly",
        type: "destructive",
      })
    } finally {
      setPatValidating(false)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // TODO: Implement goal creation API call
      console.log("Creating goal:", { goalName, targetAmount, deadline })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      addToast({
        message: "¡Meta creada! 🎯",
        type: "success",
      })
      
      navigate("/dashboard")
    } catch {
      addToast({
        message: "Error al crear meta",
        type: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base to-surface p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl border-2 border-border p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {step === 1 ? "Conecta Firefly III" : "Crea tu primera meta"}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 
              ? "Tu PAT se cifra como tu contraseña bancaria 🔒"
              : "¿Qué estás ahorrando?"}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <Input
              label="Firefly III PAT"
              type="password"
              placeholder="eyJ0eXAiOiJKV1QiLCJhbG..."
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              error={patError}
            />
            
            <Button
              onClick={handleValidatePAT}
              variant="pop"
              size="lg"
              loading={patValidating}
              className="w-full"
            >
              Conectar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <Input
              label="Nombre de la meta"
              type="text"
              placeholder="Ej: Fondo de emergencia"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              required
            />

            <Input
              label="Monto objetivo"
              type="number"
              placeholder="10000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />

            <Input
              label="Fecha límite"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="pop"
              size="lg"
              loading={submitting}
              className="w-full"
            >
              Crear meta 🎯
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export { OnboardingPage }
