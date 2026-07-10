import * as React from "react"
import { useNavigate } from "react-router-dom"
import { clearStoredAuth, getStoredAuthToken, getStoredAuthUser, setStoredAuth } from "@/services/api-client"
import { login as loginRequest, register as registerRequest } from "@/services/auth"
import type { User } from "@/types/api"
import { AuthContext, useAuth } from "./auth-context-value"

function getInitialUser(): User | null {
  return getStoredAuthToken() ? getStoredAuthUser<User>(false) : null
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(getInitialUser)
  const [error, setError] = React.useState<string | null>(null)
  const isLoading = false

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

export { AuthProvider, AuthGuard }
