"use client"

import { useState } from "react"
import { UtensilsCrossed, LayoutGrid, CalendarDays, Truck, BarChart3, Settings, LogOut, ChefHat } from "lucide-react"
import type { Section } from "./types"
import { staff } from "./data"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeSection: Section
  onSectionChange: (section: Section) => void
}

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "menu", label: "Cardapio", icon: <UtensilsCrossed size={18} /> },
  { id: "table-services", label: "Mesas", icon: <LayoutGrid size={18} /> },
  { id: "reservation", label: "Reservas", icon: <CalendarDays size={18} /> },
  { id: "delivery", label: "Delivery", icon: <Truck size={18} /> },
  { id: "accounting", label: "Financeiro", icon: <BarChart3 size={18} /> },
  { id: "settings", label: "Configuracoes", icon: <Settings size={18} /> },
]

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    // In a real app, this would clear auth state and redirect
    alert("Funcionalidade de logout seria implementada aqui.")
    setShowLogoutConfirm(false)
  }

  return (
    <>
      <aside className="w-[220px] min-w-[220px] bg-card border-r border-border flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <ChefHat size={20} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-sm text-foreground tracking-wide">CHILI POS</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <span className={cn(isActive ? "text-primary-foreground" : "text-muted-foreground")}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Staff avatars */}
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-border pt-4">
          {staff.map((s) => (
            <div key={s.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-secondary cursor-pointer">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0", s.color)}>
                {s.id}
              </div>
              <span className="text-sm text-foreground font-medium truncate">{s.name}</span>
            </div>
          ))}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2.5 px-2 py-2 mt-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-foreground mb-2">Sair do Sistema</h3>
            <p className="text-sm text-muted-foreground mb-5">Tem a certeza que deseja sair?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}