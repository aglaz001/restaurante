"use client"

import { TrendingUp, ShoppingCart, DollarSign, Users, CreditCard, Banknote, QrCode } from "lucide-react"
import { accountingData } from "./data"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { cn } from "@/lib/utils"

const statCards = [
  { label: "Receita do Dia", value: `Kz ${(accountingData.todayRevenue / 1000).toFixed(1)}K`, icon: <DollarSign size={20} />, change: "+12.5%", positive: true },
  { label: "Total de Pedidos", value: accountingData.totalOrders, icon: <ShoppingCart size={20} />, change: "+8.2%", positive: true },
  { label: "Ticket Medio", value: `Kz ${(accountingData.avgOrderValue / 1000).toFixed(1)}K`, icon: <TrendingUp size={20} />, change: "+3.1%", positive: true },
  { label: "Receita Mensal", value: `Kz ${(accountingData.monthRevenue / 1000000).toFixed(1)}M`, icon: <Users size={20} />, change: "+18.4%", positive: true },
]

const paymentMethodIcon: Record<string, React.ReactNode> = {
  "Dinheiro": <Banknote size={14} />,
  "Cartao de Credito": <CreditCard size={14} />,
  "QR Code": <QrCode size={14} />,
}

export function AccountingScreen() {
  return (
    <div className="flex flex-col h-full bg-background overflow-auto">
      <div className="p-6 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Resumo financeiro e transacoes</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {card.icon}
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  card.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Revenue chart */}
          <div className="col-span-2 bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Receita por Hora</h2>
              <span className="text-xs text-muted-foreground">Hoje</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={accountingData.revenueByHour} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `Kz ${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value: number) => [`Kz ${value.toLocaleString("pt-BR")}`, "Receita"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Items */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Itens Mais Vendidos</h2>
            <div className="flex flex-col gap-3">
              {accountingData.topItems.map((item, i) => {
                const maxRevenue = accountingData.topItems[0].revenue
                const pct = (item.revenue / maxRevenue) * 100
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono w-4">{i + 1}</span>
                        <p className="text-xs font-medium text-foreground line-clamp-1">{item.name}</p>
                      </div>
                      <span className="text-xs font-semibold text-primary shrink-0 ml-2">Kz {(item.revenue / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.sold} vendidos</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="mt-4 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Transacoes Recentes</h2>
            <button className="text-xs text-primary font-medium hover:underline">Ver todas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Pedido ID", "Mesa", "Cliente", "Forma de Pagamento", "Hora", "Valor", "Status"].map((h) => (
                    <th key={h} className="text-xs font-semibold text-muted-foreground text-left pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accountingData.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="text-xs font-mono text-foreground">{tx.id}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-foreground">{tx.table}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-medium text-foreground">{tx.customer}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {paymentMethodIcon[tx.method] || <CreditCard size={14} />}
                        {tx.method}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-muted-foreground">{tx.time}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-bold text-foreground">Kz {tx.amount.toLocaleString("pt-BR")}</span>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 capitalize">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}