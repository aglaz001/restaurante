"use client"

import { CheckCircle2, Printer, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaymentModalProps {
  total: number
  paymentMethod: string
  onNewOrder: () => void
  onClose: () => void
}

export function PaymentModal({ total, paymentMethod, onNewOrder, onClose }: PaymentModalProps) {
  const orderId = `${Math.floor(Math.random() * 90000000) + 10000000}`
  const now = new Date()
  const timeStr = now.toLocaleDateString("pt-BR", { month: "2-digit", day: "2-digit", year: "numeric" }) +
  " " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-card rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle2 size={32} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Pagamento Aprovado!</h2>
          <p className="text-2xl font-bold text-primary mt-1">Kz {total.toLocaleString("pt-BR")}</p>
        </div>

        {/* Order details */}
        <div className="border-t border-b border-border py-4 mb-5 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">N do Pedido</span>
            <span className="font-semibold text-foreground">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Forma de Pagamento</span>
            <span className="font-semibold text-foreground">{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Hora do Pagamento</span>
            <span className="font-semibold text-foreground">{timeStr}</span>
          </div>
        </div>

        {/* Actions */}
        <Button
          onClick={onNewOrder}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl mb-3"
        >
          Novo Pedido
        </Button>
        <button className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium py-2">
          <Printer size={16} />
          Imprimir Recibo
        </button>
      </div>
    </div>
  )
}