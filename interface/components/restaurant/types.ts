export type Section = "menu" | "table-services" | "reservation" | "delivery" | "accounting" | "settings"

export interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  image: string
  isVeg: boolean
  discount?: number
  description?: string
}

export interface OrderItem {
  menuItem: MenuItem
  quantity: number
  notes?: string
}

export interface TableOrder {
  tableId: number
  tableLabel: string
  customerName: string
  items: OrderItem[]
  status: "new" | "process" | "completed"
  destination: "kitchen" | "bar"
  type: "dine-in" | "takeaway" | "delivery"
}

export interface RestaurantTable {
  id: number
  label: string
  x: number
  y: number
  width: number
  height: number
  seats: number
  status: "available" | "reserved" | "occupied"
  guestName?: string
  guestCount?: number
  reservationTime?: string
  floor: number
}

export interface Reservation {
  id: string
  name: string
  guests: number
  date: string
  time: string
  table: number
  status: "confirmed" | "pending" | "cancelled"
  phone?: string
}

export interface DeliveryOrder {
  id: string
  customerName: string
  address: string
  items: { name: string; qty: number; price: number }[]
  total: number
  status: "pending" | "preparing" | "out-for-delivery" | "delivered"
  time: string
  driver?: string
}

export interface WhatsAppOrder {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  items: {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
  }[]
  total: number
  status: "pending" | "preparing" | "ready" | "finished"
  paymentStatus: "pending" | "paid" | "failed"
  createdAt: string
}
