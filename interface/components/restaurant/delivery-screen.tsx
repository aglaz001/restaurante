"use client"

import { useState } from "react"
import { Search, MapPin, Clock, Bike, ChefHat, Package, CheckCircle2, Plus, ChevronLeft } from "lucide-react"
import { deliveryOrders as initialOrders } from "./data"
import type { DeliveryOrder } from "./types"
import { cn } from "@/lib/utils"

const statusConfig = {
  pending: { icon: <Clock size={13} />, label: "Pendente", className: "bg-amber-100 text-amber-700", dotClass: "bg-amber-400" },
  preparing: { icon: <ChefHat size={13} />, label: "Preparando", className: "bg-blue-100 text-blue-700", dotClass: "bg-blue-400" },
  "out-for-delivery": { icon: <Bike size={13} />, label: "Saiu para Entrega", className: "bg-purple-100 text-purple-700", dotClass: "bg-purple-400" },
  delivered: { icon: <CheckCircle2 size={13} />, label: "Entregue", className: "bg-green-100 text-green-700", dotClass: "bg-green-400" },
}

type OrderStatus = "pending" | "preparing" | "out-for-delivery" | "delivered"

const statusFlow: OrderStatus[] = ["pending", "preparing", "out-for-delivery", "delivered"]

export function DeliveryScreen() {
  const [orders, setOrders] = useState<DeliveryOrder[]>(initialOrders)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all")

  const filtered = orders.filter((o) => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "all" || o.status === filterStatus
    return matchSearch && matchStatus
  })

  const advanceStatus = (id: string) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o
      const currentIdx = statusFlow.indexOf(o.status as OrderStatus)
      const nextStatus = statusFlow[Math.min(currentIdx + 1, statusFlow.length - 1)]
      return { ...o, status: nextStatus }
    }))
  }

  const revertStatus = (id: string) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o
      const currentIdx = statusFlow.indexOf(o.status as OrderStatus)
      const prevStatus = statusFlow[Math.max(currentIdx - 1, 0)]
      return { ...o, status: prevStatus }
    }))
  }

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    "out-for-delivery": orders.filter((o) => o.status === "out-for-delivery").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-auto">
      <div className="p-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Pedidos de Delivery</h1>
            <p className="text-sm text-muted-foreground">{orders.length} pedidos hoje</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90">
            <Plus size={16} />
            Novo Pedido
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {(["pending", "preparing", "out-for-delivery", "delivered"] as OrderStatus[]).map((s) => {
            const sc = statusConfig[s]
            return (
              <div key={s} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", sc.className)}>
                    {sc.icon}
                    {sc.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{counts[s]}</p>
                <p className="text-xs text-muted-foreground">pedidos</p>
              </div>
            )
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {(["all", "pending", "preparing", "out-for-delivery", "delivered"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border shrink-0",
                filterStatus === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              {s === "all" ? "Todos" : s === "out-for-delivery" ? "Saiu para Entrega" : s === "pending" ? "Pendente" : s === "preparing" ? "Preparando" : "Entregue"}
              <span className="ml-1.5 opacity-70">({counts[s as keyof typeof counts]})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-2.5 border border-border mb-4">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedidos..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Orders */}
        <div className="flex flex-col gap-3">
          {filtered.map((order) => {
            const sc = statusConfig[order.status as OrderStatus]
            const currentIdx = statusFlow.indexOf(order.status as OrderStatus)
            const canAdvance = currentIdx < statusFlow.length - 1
            const canRevert = currentIdx > 0
            return (
              <div key={order.id} className="bg-card rounded-2xl border border-border p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Package size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm">{order.customerName}</p>
                        <span className="text-xs text-muted-foreground font-mono">#{order.id}</span>
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", sc.className)}>
                          {sc.icon}
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={11} className="text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">{order.address}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <div className="flex flex-col gap-0.5">
                          {order.items.map((item, i) => (
                            <p key={i} className="text-xs text-muted-foreground">
                              {item.qty}x {item.name}
                            </p>
                          ))}
                        </div>
                      </div>
                      {order.driver && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Bike size={11} className="text-primary" />
                          <span className="text-xs text-primary font-medium">Entregador: {order.driver}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-base font-bold text-foreground">Kz {order.total.toLocaleString("pt-BR")}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={11} />
                      {order.time}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {canRevert && (
                        <button
                          onClick={() => revertStatus(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 flex items-center gap-1"
                        >
                          <ChevronLeft size={14} />
                          Voltar
                        </button>
                      )}
                      {canAdvance && (
                        <button
                          onClick={() => advanceStatus(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 flex items-center gap-1"
                        >
                          Avancar
                          <ChevronLeft size={14} className="rotate-180" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-1.5 mt-3">
                  {statusFlow.map((s, i) => (
                    <div
                      key={s}
                      className={cn(
                        "flex-1 h-1.5 rounded-full transition-all",
                        i <= currentIdx ? "bg-primary" : "bg-border"
                      )}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}