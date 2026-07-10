import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { ToastContext, toastVariants, useToast, type Toast } from "@/lib/toast"

let toastCount = 0

function ToastViewport() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "mb-4",
            toastVariants({ variant: toast.type })
          )}
        >
          <div className="grid gap-1">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

function ToastProviderComponent({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${toastCount++}`
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    }

    setToasts((prev) => [...prev, newToast])

    if (newToast.duration) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, newToast.duration)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

export { ToastProviderComponent as ToastProvider }
