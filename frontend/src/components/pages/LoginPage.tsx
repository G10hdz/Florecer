import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useToast } from "@/components/ui/Toast"
import { useAuth } from "@/contexts/AuthContext"

function LoginPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { login } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login(email, password)
      
      addToast({
        message: "¡Bienvenida! 🎉",
        type: "success",
      })
      
      navigate("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email o contraseña inválidos")
      addToast({
        message: "Error al iniciar sesión",
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
            Tu compañera de ahorro ✨
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="ana@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ? " " : undefined}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Iniciar sesión
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

export { LoginPage }
