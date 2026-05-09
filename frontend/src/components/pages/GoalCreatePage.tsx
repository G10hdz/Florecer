import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useToast } from "@/components/ui/Toast"

function GoalCreatePage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [submitting, setSubmitting] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    name: "",
    target_amount: "",
    currency: "MXN",
    deadline: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // TODO: Implement goal creation API call
      console.log("Creating goal:", formData)
      
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
    <div className="min-h-screen bg-gradient-to-br from-base to-surface p-4">
      <div className="max-w-md mx-auto bg-surface rounded-2xl border-2 border-border p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Nueva meta</h1>
          <p className="text-muted-foreground">
            ¿Qué estás ahorrando? 🎯
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la meta"
            type="text"
            placeholder="Ej: Viaje, Auto, Casa..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Monto objetivo"
            type="number"
            placeholder="10000"
            value={formData.target_amount}
            onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
            required
          />

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Moneda
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="flex h-11 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="MXN">MXN - Peso Mexicano</option>
              <option value="ARS">ARS - Peso Argentino</option>
              <option value="COP">COP - Peso Colombiano</option>
            </select>
          </div>

          <Input
            label="Fecha límite"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="pop"
              loading={submitting}
              className="flex-1"
            >
              Crear meta
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export { GoalCreatePage }
