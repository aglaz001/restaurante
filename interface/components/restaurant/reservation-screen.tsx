"use client"

import { useState } from "react"
import { Search, Plus, Users, Clock, CalendarDays, Phone, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { reservations as initialReservations } from "./data"
import type { Reservation } from "./types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function ReservationScreen() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [newRes, setNewRes] = useState({ name: "", guests: "2", date: "", time: "", table: "1", phone: "" })

  const filtered = reservations.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  const statusConfig = {
    confirmed: { icon: <CheckCircle2 size={14} />, label: "Confirmado", className: "bg-green-100 text-green-700" },
    pending: { icon: <AlertCircle size={14} />, label: "Pendente", className: "bg-amber-100 text-amber-700" },
    cancelled: { icon: <XCircle size={14} />, label: "Cancelado", className: "bg-red-100 text-red-700" },
  }

  const handleAddReservation = () => {
    const res: Reservation = {
      id: `R${String(reservations.length + 1).padStart(3, "0")}`,
      name: newRes.name,
      guests: parseInt(newRes.guests) || 2,
      date: newRes.date,
      time: newRes.time,
      table: parseInt(newRes.table) || 1,
      status: "pending",
      phone: newRes.phone,
    }
    setReservations((prev) => [res, ...prev])
    setShowForm(false)
    setNewRes({ name: "", guests: "2", date: "", time: "", table: "1", phone: "" })
  }

  const handleCancel = (id: string) => {
    setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: "cancelled" as const } : r))
  }

  const handleConfirm = (id: string) => {
    setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: "confirmed" as const } : r))
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-auto">
      <div className="p-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Reservas</h1>
            <p className="text-sm text-muted-foreground">{reservations.length} reservas no total</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl"
          >
            <Plus size={16} />
            Nova Reserva
          </Button>
        </div>

        {/* New Reservation Form */}
        {showForm && (
          <div className="bg-card rounded-2xl border border-border p-5 mb-6 shadow-sm">
            <h2 className="font-semibold text-foreground mb-4">Adicionar Nova Reserva</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nome do Cliente</label>
                <input
                  value={newRes.name}
                  onChange={(e) => setNewRes((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Digite o nome..."
                  className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Telefone</label>
                <input
                  value={newRes.phone}
                  onChange={(e) => setNewRes((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+55 11 9 9999 9999"
                  className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Numero de Convidados</label>
                <input
                  type="number"
                  value={newRes.guests}
                  onChange={(e) => setNewRes((p) => ({ ...p, guests: e.target.value }))}
                  min="1"
                  className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Numero da Mesa</label>
                <input
                  type="number"
                  value={newRes.table}
                  onChange={(e) => setNewRes((p) => ({ ...p, table: e.target.value }))}
                  min="1"
                  className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Data</label>
                <input
                  type="date"
                  value={newRes.date}
                  onChange={(e) => setNewRes((p) => ({ ...p, date: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Hora</label>
                <input
                  type="time"
                  value={newRes.time}
                  onChange={(e) => setNewRes((p) => ({ ...p, time: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleAddReservation} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                Adicionar Reserva
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-2.5 border border-border mb-4">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar reservas..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Reservations list */}
        <div className="flex flex-col gap-3">
          {filtered.map((res) => {
            const sc = statusConfig[res.status]
            return (
              <div key={res.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {res.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-sm">{res.name}</p>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", sc.className)}>
                      {sc.icon}
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users size={11} />
                      {res.guests} convidados
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays size={11} />
                      {res.date}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={11} />
                      {res.time}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">Mesa {res.table}</span>
                    {res.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone size={11} />
                        {res.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {res.status === "pending" && (
                    <button
                      onClick={() => handleConfirm(res.id)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
                    >
                      Confirmar
                    </button>
                  )}
                  {res.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancel(res.id)}
                      className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-xs font-medium hover:bg-secondary"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
