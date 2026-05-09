import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useToast } from "@/components/ui/Toast"

export interface DepositModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { amount: number; note: string }) => Promise<void>
  currency: string
  defaultAmount?: number
  defaultNote?: string
}

function DepositModal({ open, onClose, onSubmit, currency, defaultAmount, defaultNote }: DepositModalProps) {
  const [amount, setAmount] = React.useState("")
  const [note, setNote] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const { addToast } = useToast()

  React.useEffect(() => {
    if (open) {
      setAmount(defaultAmount ? String(defaultAmount) : "")
      setNote(defaultNote || "")
    }
  }, [open, defaultAmount, defaultNote])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      addToast({
        message: "Ingresa un monto válido",
        type: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ amount: amountNum, note })
      addToast({
        message: "¡Depósito registrado con éxito! 🎉",
        type: "success",
      })
      setAmount("")
      setNote("")
      onClose()
    } catch (error) {
      addToast({
        message: "Error al registrar depósito",
        type: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl border-2 border-border p-6 w-full max-w-md shadow-2xl animate-in fade-in-0 zoom-in-95">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          💰 Registrar depósito
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Monto"
            type="number"
            step="0.01"
            min="0"
            placeholder={`0.00 ${currency}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Input
            label="Nota (opcional)"
            type="text"
            placeholder="Ej: Quincena, Bono, etc."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
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
              Depositar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DepositButton({ 
  goalId, 
  currency, 
  onSuccess,
  defaultAmount,
  defaultNote,
  children 
}: { 
  goalId: string; 
  currency: string; 
  onSuccess?: () => void;
  defaultAmount?: number;
  defaultNote?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async (data: { amount: number; note: string }) => {
    // TODO: Implement API call
    console.log("Deposit:", { goalId, ...data })
    onSuccess?.()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="pop" size="lg">
        {children || "💰 Registrar depósito"}
      </Button>
      <DepositModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        currency={currency}
        defaultAmount={defaultAmount}
        defaultNote={defaultNote}
      />
    </>
  )
}

export { DepositButton, DepositModal }
