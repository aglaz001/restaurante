"use client"

import { useState, useMemo } from "react"
import { Search, SlidersHorizontal, Leaf, Flame, Plus, Minus } from "lucide-react"
import { menuItems, categories } from "./data"
import { OrderPanel } from "./order-panel"
import { ActiveOrdersBar } from "./active-orders-bar"
import type { OrderItem } from "./types"
import { cn } from "@/lib/utils"

interface MenuScreenProps {
  onPaymentSuccess: (total: number, method: string) => void
  whatsappOrders?: {
    id: string
    customerName: string
    items: { quantity: number }[]
    status: string
  }[]
  onWhatsAppOrderClick?: (orderId: string) => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  Todos: <div className="grid grid-cols-2 gap-0.5">{[...Array(4)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-sm bg-current" />)}</div>,
  "Cafe da Manha": <span className="text-sm">☕</span>,
  Sopas: <span className="text-sm">🍜</span>,
  Massas: <span className="text-sm">🍝</span>,
  "Prato Principal": <span className="text-sm">🍽️</span>,
  Hamburgueres: <span className="text-sm">🍔</span>,
}

export function MenuScreen({ onPaymentSuccess, whatsappOrders = [], onWhatsAppOrderClick }: MenuScreenProps) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedTableId, setSelectedTableId] = useState(4)
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway" | "delivery">("dine-in")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "qr">("cash")

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = activeCategory === "Todos" || item.category === activeCategory
      return matchSearch && matchCat
    })
  }, [search, activeCategory])

  const addToOrder = (itemId: string) => {
    const menuItem = menuItems.find((m) => m.id === itemId)!
    setOrderItems((prev) => {
      const existing = prev.find((o) => o.menuItem.id === itemId)
      if (existing) {
        return prev.map((o) => o.menuItem.id === itemId ? { ...o, quantity: o.quantity + 1 } : o)
      }
      return [...prev, { menuItem, quantity: 1 }]
    })
  }

  const getItemQty = (id: string) => orderItems.find((o) => o.menuItem.id === id)?.quantity ?? 0

  const handleQuantityChange = (itemId: string, delta: number) => {
    setOrderItems((prev) => {
      return prev
        .map((o) => o.menuItem.id === itemId ? { ...o, quantity: Math.max(0, o.quantity + delta) } : o)
        .filter((o) => o.quantity > 0)
    })
  }

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((o) => o.menuItem.id !== itemId))
  }

  const subtotal = orderItems.reduce((acc, it) => acc + it.menuItem.price * it.quantity, 0)
  const total = subtotal * 1.05

  const handlePlaceOrder = () => {
    onPaymentSuccess(total, paymentMethod === "cash" ? "Dinheiro" : paymentMethod === "card" ? "Cartao" : "QR Code")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden">
        {/* Menu area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-5 py-3 bg-card border-b border-border">
            <div className="flex-1 flex items-center gap-2 bg-background rounded-xl px-3 py-2 border border-border">
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto..."
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button className="p-2.5 rounded-xl border border-border bg-background hover:bg-secondary text-muted-foreground">
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2.5 px-5 py-3 overflow-x-auto border-b border-border bg-card">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border min-w-[80px] transition-all shrink-0",
                  activeCategory === cat.name
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary"
                )}
              >
                <span className="flex items-center justify-center w-6 h-5">
                  {categoryIcons[cat.name]}
                </span>
                <span className="text-xs font-semibold leading-none">{cat.name}</span>
                <span className="text-[10px] leading-none">{cat.count} Items</span>
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((item) => {
                const qty = getItemQty(item.id)
                const displayPrice = item.discount
                  ? item.price * (1 - item.discount / 100)
                  : item.price
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "bg-card rounded-2xl border overflow-hidden transition-all hover:shadow-md",
                      qty > 0 ? "border-primary shadow-sm" : "border-border"
                    )}
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-32 object-cover"
                        crossOrigin="anonymous"
                      />
                      {item.discount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          {item.discount}% Off
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2 min-h-[28px]">
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-primary">Kz {displayPrice.toLocaleString("pt-BR")}</span>
                        <div className="flex items-center gap-1">
                          {item.isVeg ? (
                            <Leaf size={11} className="text-green-500" />
                          ) : (
                            <Flame size={11} className="text-red-500" />
                          )}
                          <span className={cn("text-[10px] font-medium", item.isVeg ? "text-green-600" : "text-red-500")}>
                            {item.isVeg ? "Vegano" : "Nao Vegano"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2.5">
                        {qty === 0 ? (
                          <button
                            onClick={() => addToOrder(item.id)}
                            className="w-full py-2 text-xs font-semibold rounded-xl bg-accent text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            Adicionar
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-bold w-5 text-center">{qty}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                <Search size={32} className="opacity-30" />
                <p className="text-sm">Nenhum item encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Panel */}
        <OrderPanel
          tableId={selectedTableId}
          tableLabel={`T${selectedTableId}`}
          customerName="Floyd Miles"
          orderType={orderType}
          onOrderTypeChange={setOrderType}
          items={orderItems}
          onQuantityChange={handleQuantityChange}
          onRemoveItem={handleRemoveItem}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>

      {/* Active orders bar */}
      <ActiveOrdersBar
        selectedTable={selectedTableId}
        onSelectTable={setSelectedTableId}
        whatsappOrders={whatsappOrders}
      />
    </div>
  )
}
