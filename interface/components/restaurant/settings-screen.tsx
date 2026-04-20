"use client"

import { useState } from "react"
import { Store, Bell, Printer, Wifi, Shield, ChevronRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const settingsSections = [
  { id: "general", label: "Geral", icon: <Store size={18} /> },
  { id: "notifications", label: "Notificacoes", icon: <Bell size={18} /> },
  { id: "printer", label: "Impressora", icon: <Printer size={18} /> },
  { id: "network", label: "Rede", icon: <Wifi size={18} /> },
  { id: "security", label: "Seguranca", icon: <Shield size={18} /> },
]

export function SettingsScreen() {
  const [activeSection, setActiveSection] = useState("general")
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    restaurantName: "CHILI POS",
    address: "Luanda, Angola",
    phone: "+244 923 456 789",
    email: "info@chillipos.com",
    taxRate: "5",
    currency: "AOA",
    orderNotifications: true,
    deliveryAlerts: true,
    soundEffects: true,
    printerIp: "192.168.1.100",
    printerPort: "9100",
    autoPrint: true,
    printReceipt: true,
  })

  const update = (key: string, value: string | boolean) => {
    setSettings((p) => ({ ...p, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTestPrinter = () => {
    alert(`Testando impressora em ${settings.printerIp}:${settings.printerPort}...`)
  }

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Settings sidebar */}
      <div className="w-56 min-w-56 border-r border-border bg-card p-3 flex flex-col gap-1">
        <p className="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-2 uppercase tracking-wider">Configuracoes</p>
        {settingsSections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left",
              activeSection === s.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-auto p-6">
        {activeSection === "general" && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-5">Configuracoes Gerais</h2>
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nome do Restaurante" value={settings.restaurantName} onChange={(v) => update("restaurantName", v)} />
                <Field label="Telefone" value={settings.phone} onChange={(v) => update("phone", v)} />
                <Field label="E-mail" value={settings.email} onChange={(v) => update("email", v)} />
                <Field label="Endereco" value={settings.address} onChange={(v) => update("address", v)} />
                <Field label="Taxa de Imposto (%)" value={settings.taxRate} onChange={(v) => update("taxRate", v)} type="number" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Moeda</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                  >
                    <option value="AOA">Kwanza (AOA)</option>
                    <option value="USD">Dolar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="BRL">Real (BRL)</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2">
                <Save size={15} />
                {saved ? "Alteracoes Salvas!" : "Salvar Alteracoes"}
              </Button>
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-5">Notificacoes</h2>
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              {[
                { key: "orderNotifications", label: "Novos Pedidos", desc: "Receba notificacoes quando um novo pedido for registrado" },
                { key: "deliveryAlerts", label: "Alertas de Delivery", desc: "Receba alertas sobre mudancas no status de entrega" },
                { key: "soundEffects", label: "Efeitos Sonoros", desc: "Reproduzir sons para novos pedidos e alertas" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Toggle value={settings[item.key as keyof typeof settings] as boolean} onChange={(v) => update(item.key, v)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "printer" && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-5">Configuracao de Impressora</h2>
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="IP da Impressora" value={settings.printerIp} onChange={(v) => update("printerIp", v)} />
                <Field label="Porta da Impressora" value={settings.printerPort} onChange={(v) => update("printerPort", v)} />
              </div>
              {[
                { key: "autoPrint", label: "Impressao Automatica no Pedido", desc: "Imprimir automaticamente ao registrar pedido" },
                { key: "printReceipt", label: "Imprimir Recibo", desc: "Imprimir recibo do cliente apos pagamento" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Toggle value={settings[item.key as keyof typeof settings] as boolean} onChange={(v) => update(item.key, v)} />
                </div>
              ))}
              <button
                onClick={handleTestPrinter}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20"
              >
                <Printer size={16} />
                Testar Conexao da Impressora
              </button>
            </div>
          </div>
        )}

        {(activeSection === "network" || activeSection === "security") && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-5">
              {activeSection === "network" ? "Configuracoes de Rede" : "Configuracoes de Seguranca"}
            </h2>
            <div className="bg-card rounded-2xl border border-border divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-secondary/30 cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {activeSection === "network"
                        ? ["Rede Wi-Fi", "Configuracoes de Proxy", "Configuracao de IP"][i - 1]
                        : ["Alterar Senha", "Autenticacao em Dois Fatores", "Controle de Acesso"][i - 1]}
                    </p>
                    <p className="text-xs text-muted-foreground">Clique para configurar</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
      />
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "w-11 h-6 rounded-full relative transition-colors",
        value ? "bg-primary" : "bg-border"
      )}
    >
      <span
        className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
          value ? "left-6" : "left-1"
        )}
      />
    </button>
  )
}