export interface Customer {
  id: string
  phone_number: string
  name?: string
  last_address?: string
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  origin: 'whatsapp' | 'table'
  status: 'pending' | 'preparing' | 'ready' | 'finished'
  total_price: number
  payment_status: 'pending' | 'paid' | 'failed'
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  notes?: string
  created_at: string
}

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

// GPT-4 Response Types
export interface GPTIntent {
  intent: 'order' | 'add_item' | 'remove_item' | 'confirm' | 'cancel' | 'greeting' | 'menu_query' | 'unknown'
  items?: {
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
  }[]
  message: string
  customer_name?: string
  customer_address?: string
}

// Evolution API Webhook Payload
export interface EvolutionWebhookPayload {
  event: 'messages.upsert' | 'connection.update' | string
  instanceId: string
  data: {
    key?: {
      remoteJid: string
      id?: string
      fromMe?: boolean
    }
    message?: {
      conversation?: string
      extendedTextMessage?: {
        text: string
      }
    }
    pushName?: string
  }
}