"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export interface RealtimeOrder {
  id: string
  customer_id: string
  origin: "whatsapp" | "table"
  status: "pending" | "preparing" | "ready" | "finished"
  total_price: number
  payment_status: "pending" | "paid" | "failed"
  notes?: string
  created_at: string
  updated_at: string
  customer?: {
    id: string
    name?: string
    phone_number: string
  }
  items?: {
    id: string
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
  }[]
}

interface UseOrdersOptions {
  onNewWhatsAppOrder?: (order: RealtimeOrder) => void
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<RealtimeOrder[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch initial orders
  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customer:customers(id, name, phone_number),
          items:order_items(*)
        `)
        .in("status", ["pending", "preparing", "ready"])
        .order("created_at", { ascending: false })

      if (!error && data) {
        setOrders(data)
      }
      setLoading(false)
    }

    fetchOrders()
  }, [])

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: "status=in.(pending,preparing,ready)"
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch full order with relations
            const { data: fullOrder } = await supabase
              .from("orders")
              .select(`
                *,
                customer:customers(id, name, phone_number),
                items:order_items(*)
              `)
              .eq("id", payload.new.id)
              .single()

            if (fullOrder) {
              setOrders((prev) => [fullOrder, ...prev])

              // Play sound and notify for WhatsApp orders
              if (fullOrder.origin === "whatsapp" && options.onNewWhatsAppOrder) {
                playNotificationSound()
                options.onNewWhatsAppOrder(fullOrder)
              }
            }
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            )

            // If order is finished, remove from active list
            if (payload.new.status === "finished") {
              setOrders((prev) => prev.filter((o) => o.id !== payload.new.id))
            }
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [options.onNewWhatsAppOrder])

  const updateOrderStatus = useCallback(
    async (orderId: string, status: "pending" | "preparing" | "ready" | "finished") => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)

      if (!error) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status } : order
          )
        )
      }

      return !error
    },
    []
  )

  return {
    orders,
    loading,
    updateOrderStatus
  }
}

function playNotificationSound() {
  try {
    const audio = new Audio("/notification.mp3")
    audio.volume = 0.5
    audio.play().catch(() => {
      // Fallback: try system notification sound
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"
      gainNode.gain.value = 0.1

      oscillator.start()
      setTimeout(() => {
        oscillator.stop()
        ctx.close()
      }, 200)
    })
  } catch {
    console.warn("Could not play notification sound")
  }
}