"use client"

import { useState } from "react"
import { Sidebar } from "@/components/restaurant/sidebar"
import { MenuScreen } from "@/components/restaurant/menu-screen"
import { TableServicesScreen } from "@/components/restaurant/table-services-screen"
import { ReservationScreen } from "@/components/restaurant/reservation-screen"
import { DeliveryScreen } from "@/components/restaurant/delivery-screen"
import { AccountingScreen } from "@/components/restaurant/accounting-screen"
import { SettingsScreen } from "@/components/restaurant/settings-screen"
import { PaymentModal } from "@/components/restaurant/payment-modal"
import { useOrders } from "@/hooks/use-orders"
import type { Section } from "@/components/restaurant/types"

export default function RestaurantApp() {
  const [activeSection, setActiveSection] = useState<Section>("menu")
  const [paymentState, setPaymentState] = useState<{ show: boolean; total: number; method: string }>({
    show: false,
    total: 0,
    method: "Cash",
  })

  // Supabase Realtime orders subscription
  const { orders: whatsappOrders, updateOrderStatus } = useOrders({
    onNewWhatsAppOrder: (order) => {
      // Could show a toast notification here
      console.log("New WhatsApp order:", order.id)
    }
  })

  const handlePaymentSuccess = (total: number, method: string) => {
    setPaymentState({ show: true, total, method })
  }

  const handleNewOrder = () => {
    setPaymentState({ show: false, total: 0, method: "Cash" })
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="flex-1 overflow-hidden flex flex-col">
        {activeSection === "menu" && (
          <MenuScreen
            onPaymentSuccess={handlePaymentSuccess}
            whatsappOrders={whatsappOrders}
          />
        )}
        {activeSection === "table-services" && <TableServicesScreen />}
        {activeSection === "reservation" && <ReservationScreen />}
        {activeSection === "delivery" && <DeliveryScreen />}
        {activeSection === "accounting" && <AccountingScreen />}
        {activeSection === "settings" && <SettingsScreen />}
      </main>

      {paymentState.show && (
        <PaymentModal
          total={paymentState.total}
          paymentMethod={paymentState.method}
          onNewOrder={handleNewOrder}
          onClose={handleNewOrder}
        />
      )}
    </div>
  )
}
