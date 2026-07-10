import * as React from "react"
import { useNavigate } from "react-router-dom"
import { clearStoredAuth, getStoredAuthToken, getStoredAuthUser, setStoredAuth } from "@/services/api-client"
import { login as loginRequest, register as registerRequest } from "@/services/auth"
import type { User } from "@/types/api"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const storedToken = getStoredAuthToken()
    const storedUser = getStoredAuthUser<User>()
    if (storedToken && storedUser) {
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    try {
      const response = await loginRequest({ email, password })
      setStoredAuth(response.token, response.user)
      setUser(response.user)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      throw err
    }
  }

  const register = async (email: string, password: string) => {
    setError(null)
    try {
      const response = await registerRequest({ email, password })
      setStoredAuth(response.token, response.user)
      setUser(response.user)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed"
      setError(message)
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    clearStoredAuth()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base to-surface">
        <div className="text-2xl text-foreground">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export { AuthProvider, useAuth, AuthGuard }
