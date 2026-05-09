import * as React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, AuthGuard } from "@/contexts/AuthContext"
import { ToastProvider } from "@/components/ui/Toast"
import {
  LoginPage,
  RegisterPage,
  OnboardingPage,
  DashboardPage,
  GoalCreatePage,
  WardrobePage,
  ShareCardPage,
} from "@/components/pages"
import { PixelArtStudio } from "@/components/pages/PixelArtStudioPage"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/goals/new"
        element={
          <ProtectedRoute>
            <GoalCreatePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/wardrobe"
        element={
          <ProtectedRoute>
            <WardrobePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/share"
        element={
          <ProtectedRoute>
            <ShareCardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/studio"
        element={
          <ProtectedRoute>
            <PixelArtStudio />
          </ProtectedRoute>
        }
      />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
