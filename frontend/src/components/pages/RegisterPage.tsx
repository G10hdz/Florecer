import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useToast } from "@/lib/toast"
import { useAuth } from "@/contexts/auth-context-value"

function RegisterPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { register } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      setLoading(false)
      return
    }

    try {
      await register(email, password)
      
      addToast({
        message: "¡Cuenta creada! 🎉",
        type: "success",
      })
      
      navigate("/onboarding")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cuenta")
      addToast({
        message: "Error en registro",
        type: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base to-surface p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl border-2 border-border p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">girl-finance</h1>
          <p className="text-muted-foreground">
            Comienza tu viaje de ahorro ✨
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="ana@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error ? " " : undefined}
            required
          />

          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={error}
            required
          />

          <Button
            type="submit"
            variant="pop"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Crear cuenta
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export { RegisterPage }
