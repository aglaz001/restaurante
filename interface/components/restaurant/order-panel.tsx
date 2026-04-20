"use client"

import { Minus, Plus, Pencil, Banknote, CreditCard, QrCode, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OrderItem } from "./types"
import { cn } from "@/lib/utils"

interface OrderPanelProps {
  tableId: number
  tableLabel: string
  customerName: string
  orderType: "dine-in" | "takeaway" | "delivery"
  onOrderTypeChange: (type: "dine-in" | "takeaway" | "delivery") => void
  items: OrderItem[]
  onQuantityChange: (itemId: string, delta: number) => void
  onRemoveItem: (itemId: string) => void
  paymentMethod: "cash" | "card" | "qr"
  onPaymentMethodChange: (m: "cash" | "card" | "qr") => void
  onPlaceOrder: () => void
}

const TAX_RATE = 0.05

export function OrderPanel({
  tableId,
  tableLabel,
  customerName,
  orderType,
  onOrderTypeChange,
  items,
  onQuantityChange,
  onRemoveItem,
  paymentMethod,
  onPaymentMethodChange,
  onPlaceOrder,
}: OrderPanelProps) {
  const subtotal = items.reduce((acc, it) => acc + it.menuItem.price * it.quantity, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  const orderTypeOptions: { key: "dine-in" | "takeaway" | "delivery"; label: string }[] = [
    { key: "dine-in", label: "Mesa" },
    { key: "takeaway", label: "Para Levar" },
    { key: "delivery", label: "Delivery" },
  ]

  return (
    <div className="w-[310px] min-w-[310px] bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-border">
        <div>
          <h2 className="font-bold text-base text-foreground">Mesa {tableId}</h2>
          <p className="text-xs text-muted-foreground">{customerName}</p>
        </div>
        <button className="text-muted-foreground hover:text-foreground p-1">
          <Pencil size={15} />
        </button>
      </div>

      {/* Order type tabs */}
      <div className="flex gap-1.5 px-4 py-3 border-b border-border">
        {orderTypeOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onOrderTypeChange(opt.key)}
            className={cn(
              "flex-1 text-xs py-1.5 rounded-lg font-medium transition-all border",
              orderType === opt.key
                ? "bg-primary/10 text-primary border-primary"
                : "border-border text-muted-foreground hover:bg-secondary"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Order items */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
            <span className="text-3xl">🍽️</span>
            <p>Nenhum item adicionado</p>
          </div>
        )}
        {items.map((item) => {
          const finalPrice = item.menuItem.discount
            ? item.menuItem.price * (1 - item.menuItem.discount / 100)
            : item.menuItem.price
          return (
            <div key={item.menuItem.id} className="flex gap-3 items-start">
              <img
                src={item.menuItem.image}
                alt={item.menuItem.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{item.menuItem.name}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs font-bold text-primary">Kz {finalPrice.toLocaleString("pt-BR")}</span>
                  <span className="text-xs text-muted-foreground">{item.quantity}x</span>
                  <span className="text-xs font-semibold text-foreground">Kz {(finalPrice * item.quantity).toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onQuantityChange(item.menuItem.id, -1)}
                      className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="w-5 text-center text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => onQuantityChange(item.menuItem.id, 1)}
                      className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <button onClick={() => onRemoveItem(item.menuItem.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Totals */}
      <div className="px-4 py-3 border-t border-border space-y-1.5">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>Kz {subtotal.toLocaleString("pt-BR")}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Imposto 5%</span>
          <span>Kz {tax.toLocaleString("pt-BR")}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-dashed border-border">
          <span>Total</span>
          <span>Kz {total.toLocaleString("pt-BR")}</span>
        </div>
      </div>

      {/* Payment method */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex gap-2">
          {[
            { key: "cash" as const, icon: <Banknote size={18} />, label: "Dinheiro" },
            { key: "card" as const, icon: <CreditCard size={18} />, label: "Cartao" },
            { key: "qr" as const, icon: <QrCode size={18} />, label: "QR Code" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => onPaymentMethodChange(m.key)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all",
                paymentMethod === m.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              {m.icon}
              <span className="text-[10px] leading-tight text-center">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Place Order */}
      <div className="px-4 pb-4">
        <Button
          onClick={onPlaceOrder}
          disabled={items.length === 0}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl text-sm"
        >
          Finalizar Pedido
        </Button>
      </div>
    </div>
  )
}