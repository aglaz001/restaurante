"use client"

import { useState } from "react"
import { Plus, Minus, CalendarDays, Clock } from "lucide-react"
import { restaurantTables } from "./data"
import { ActiveOrdersBar } from "./active-orders-bar"
import type { RestaurantTable } from "./types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const floors = ["Primeiro Andar", "Segundo Andar", "Terceiro Andar"]

export function TableServicesScreen() {
  const [activeFloor, setActiveFloor] = useState(0)
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null)
  const [selectedTableBar, setSelectedTableBar] = useState<number | null>(null)
  const [bookingName, setBookingName] = useState("")
  const [guestCount, setGuestCount] = useState(2)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [booked, setBooked] = useState(false)
  const [tables, setTables] = useState<RestaurantTable[]>(restaurantTables)

  const floorTables = tables.filter((t) => t.floor === activeFloor + 1)

  const handleSelectTable = (table: RestaurantTable) => {
    setSelectedTable(table)
    setBooked(false)
  }

  const handleBook = () => {
    if (!selectedTable || !bookingName || !bookingDate || !bookingTime) {
      alert("Por favor, preencha todos os campos e selecione uma mesa.")
      return
    }

    setTables((prev) => prev.map((t) =>
      t.id === selectedTable.id
        ? { ...t, status: "reserved" as const, guestName: bookingName, guestCount, reservationTime: bookingTime }
        : t
    ))

    setBooked(true)
    setTimeout(() => {
      setBooked(false)
      setBookingName("")
      setGuestCount(2)
      setBookingDate("")
      setBookingTime("")
      setSelectedTable(null)
    }, 2000)
  }

  const handleLiberateTable = (tableId: number) => {
    setTables((prev) => prev.map((t) =>
      t.id === tableId
        ? { ...t, status: "available" as const, guestName: undefined, guestCount: undefined, reservationTime: undefined }
        : t
    ))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden">
        {/* Floor map area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Floor tabs */}
          <div className="flex items-center gap-2 px-5 py-3 bg-card border-b border-border">
            {floors.map((floor, idx) => (
              <button
                key={floor}
                onClick={() => { setActiveFloor(idx); setSelectedTable(null) }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                  activeFloor === idx
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {floor}
              </button>
            ))}
          </div>

          {/* SVG Floor plan */}
          <div className="flex-1 overflow-auto p-6">
            <svg
              viewBox="0 0 620 580"
              className="w-full max-w-2xl mx-auto"
              style={{ minHeight: 420 }}
            >
              {/* Background dashed area */}
              <rect x="20" y="20" width="580" height="540" rx="16" fill="#f8faf8" stroke="#d1fae5" strokeWidth="1.5" strokeDasharray="6 4" />

              {floorTables.map((table) => {
                const isSelected = selectedTable?.id === table.id
                const isReserved = table.status === "reserved"
                const isAvailable = table.status === "available"

                const fillColor = isReserved ? "#FFF7ED" : "#F0FDF4"
                const strokeColor = isSelected ? "#16a34a" : isReserved ? "#F97316" : "#22c55e"
                const labelBg = isReserved ? "#F97316" : "#22c55e"
                const badgeText = isReserved ? "Reservada" : "Disponivel"
                const badgeFill = isReserved ? "#F97316" : "#22c55e"

                // Chair positions (simplified)
                const chairs = []
                const cw = 18, ch = 12
                // top chairs
                for (let i = 0; i < Math.min(2, Math.floor(table.width / 50)); i++) {
                  chairs.push({ cx: table.x + 30 + i * 55, cy: table.y - 10, w: cw, h: ch, pos: "top" })
                }
                // bottom chairs
                for (let i = 0; i < Math.min(2, Math.floor(table.width / 50)); i++) {
                  chairs.push({ cx: table.x + 30 + i * 55, cy: table.y + table.height + 2, w: cw, h: ch, pos: "bottom" })
                }
                // left chair
                chairs.push({ cx: table.x - 10, cy: table.y + table.height / 2 - 6, w: ch, h: cw, pos: "left" })
                // right chair
                chairs.push({ cx: table.x + table.width + 2, cy: table.y + table.height / 2 - 6, w: ch, h: cw, pos: "right" })

                return (
                  <g key={table.id} onClick={() => handleSelectTable(table)} style={{ cursor: "pointer" }}>
                    {/* Chairs */}
                    {chairs.map((c, ci) => (
                      <rect
                        key={ci}
                        x={c.cx}
                        y={c.cy}
                        width={c.w}
                        height={c.h}
                        rx="4"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth="1.5"
                        strokeDasharray={isAvailable ? "4 3" : ""}
                      />
                    ))}

                    {/* Table body */}
                    <rect
                      x={table.x}
                      y={table.y}
                      width={table.width}
                      height={table.height}
                      rx="12"
                      fill={isSelected ? (isReserved ? "#FEF3C7" : "#DCFCE7") : fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />

                    {/* Table label badge */}
                    <rect x={table.x + 6} y={table.y + 6} width={24} height={18} rx="5" fill={labelBg} />
                    <text x={table.x + 18} y={table.y + 19} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                      {table.label}
                    </text>

                    {/* Reservation time */}
                    {table.reservationTime && (
                      <text x={table.x + table.width - 6} y={table.y + 14} textAnchor="end" fill="#6b7280" fontSize="7.5">
                        {table.reservationTime}
                      </text>
                    )}

                    {/* Guest name */}
                    {table.guestName && (
                      <text x={table.x + table.width / 2} y={table.y + table.height / 2 + 2} textAnchor="middle" fill="#374151" fontSize="8.5" fontWeight="600">
                        {table.guestName}
                      </text>
                    )}
                    {table.guestCount && (
                      <text x={table.x + table.width / 2} y={table.y + table.height / 2 + 14} textAnchor="middle" fill="#6b7280" fontSize="7.5">
                        {table.guestCount} Lugares
                      </text>
                    )}

                    {/* Status badge */}
                    <rect
                      x={table.x + table.width / 2 - 24}
                      y={table.y + table.height - 20}
                      width={48}
                      height={14}
                      rx="5"
                      fill={badgeFill}
                      opacity="0.9"
                    />
                    <text
                      x={table.x + table.width / 2}
                      y={table.y + table.height - 10}
                      textAnchor="middle"
                      fill="white"
                      fontSize="7"
                      fontWeight="bold"
                    >
                      {badgeText}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Book Table Panel */}
        <div className="w-[300px] min-w-[300px] bg-card border-l border-border flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
            <h2 className="font-bold text-base text-foreground">Reservar Mesa</h2>
            {selectedTable && (
              <span className="text-sm font-bold text-primary">{selectedTable.label}</span>
            )}
          </div>

          <div className="flex-1 px-5 py-4 flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Nome do Cliente</label>
              <input
                value={bookingName}
                onChange={(e) => setBookingName(e.target.value)}
                placeholder="Digite o nome..."
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* Number of guests */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Numero de Convidados</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
                >
                  <Minus size={14} />
                </button>
                <span className="flex-1 text-center font-bold text-foreground">{guestCount}</span>
                <button
                  onClick={() => setGuestCount((n) => n + 1)}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Data</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-background">
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none"
                />
                <CalendarDays size={16} className="text-primary shrink-0" />
              </div>
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Hora</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-background">
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none"
                />
                <Clock size={16} className="text-primary shrink-0" />
              </div>
            </div>

            <Button
              onClick={handleBook}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl mt-2"
            >
              {booked ? "Reservado!" : "Reservar Mesa"}
            </Button>

            {selectedTable && (
              <div className="bg-accent rounded-xl p-3 text-xs text-primary">
                <p className="font-semibold">Selecionada: {selectedTable.label}</p>
                <p className="text-muted-foreground mt-1">Status: {selectedTable.status === "reserved" ? "Reservada" : "Disponivel"}</p>
                {selectedTable.guestName && <p className="text-muted-foreground">Atual: {selectedTable.guestName}</p>}
                {selectedTable.status === "reserved" && (
                  <button
                    onClick={() => handleLiberateTable(selectedTable.id)}
                    className="mt-2 text-red-600 font-medium hover:underline"
                  >
                    Liberar Mesa
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ActiveOrdersBar selectedTable={selectedTableBar} onSelectTable={setSelectedTableBar} />
    </div>
  )
}