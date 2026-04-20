import { findOrCreateCustomer, updateCustomer, createOrder, createOrderItems, updateOrderTotal, getMenuItems } from './supabase.js'
import { getGPTResponse } from './openai.js'
import type { GPTIntent, MenuItem } from '../types/index.js'

interface PendingOrder {
  customer_id: string
  items: {
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
  }[]
  total: number
}

const pendingOrders = new Map<string, PendingOrder>()

export async function processMessage(
  phoneNumber: string,
  message: string,
  customerName?: string,
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[]
): Promise<{ response: string; shouldCreateOrder: boolean }> {
  // Get menu items
  const menuItems = await getMenuItems()

  // Find or create customer
  const customer = await findOrCreateCustomer(phoneNumber, customerName)

  // Get GPT response
  const gptIntent = await getGPTResponse(
    message,
    menuItems,
    customer.name || undefined,
    customer.last_address || undefined,
    conversationHistory
  )

  // Handle different intents
  switch (gptIntent.intent) {
    case 'order':
    case 'add_item': {
      if (!gptIntent.items || gptIntent.items.length === 0) {
        return { response: gptIntent.message, shouldCreateOrder: false }
      }

      const total = gptIntent.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

      // Store pending order for confirmation
      pendingOrders.set(phoneNumber, {
        customer_id: customer.id,
        items: gptIntent.items,
        total
      })

      const itemsList = gptIntent.items
        .map(item => `${item.quantity}x ${item.product_name} (R$ ${(item.unit_price * item.quantity).toFixed(2)})`)
        .join(', ')

      return {
        response: `${gptIntent.message}\n\nPedido registrado:\n${itemsList}\n\nTotal: R$ ${total.toFixed(2)}\n\nDigite "confirmar" para confirmar ou "cancelar" para anular.`,
        shouldCreateOrder: false
      }
    }

    case 'confirm': {
      const pendingOrder = pendingOrders.get(phoneNumber)
      if (!pendingOrder) {
        return { response: gptIntent.message || "Não tenho nenhum pedido seu pendente para confirmar.", shouldCreateOrder: false }
      }

      try {
        // Create order in database
        const order = await createOrder({
          customer_id: pendingOrder.customer_id,
          origin: 'whatsapp',
          notes: `Pedido via WhatsApp -Cliente: ${customer.name || 'Não identificado'}`
        })

        // Create order items
        const orderItems = pendingOrder.items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))

        await createOrderItems(orderItems)

        // Update order total
        await updateOrderTotal(order.id, pendingOrder.total)

        // Clear pending order
        pendingOrders.delete(phoneNumber)

        // Update customer name if we learned it
        if (gptIntent.customer_name && !customer.name) {
          await updateCustomer(customer.id, { name: gptIntent.customer_name })
        }

        return {
          response: `✅ Pedido confirmado! Seu pedido #${order.id.slice(0, 8)} está sendo preparado.\n\nTotal: R$ ${pendingOrder.total.toFixed(2)}\n\nAcompanhe pelo nosso dashboard!`,
          shouldCreateOrder: true
        }
      } catch (error) {
        console.error('Error creating order:', error)
        return {
          response: 'Desculpe, tive um problema ao registrar seu pedido. Tente novamente.',
          shouldCreateOrder: false
        }
      }
    }

    case 'cancel': {
      const deleted = pendingOrders.delete(phoneNumber)
      return {
        response: deleted
          ? 'Pedido cancelado com sucesso!'
          : gptIntent.message || "Não tinha nenhum pedido pendente para cancelar.",
        shouldCreateOrder: false
      }
    }

    case 'menu_query': {
      // Return menu formatted message
      const menuList = menuItems
        .map(item => `• ${item.name} - R$ ${item.price.toFixed(2)}`)
        .join('\n')
      return {
        response: `📋 *Cardápio*\n\n${menuList}\n\nO que deseja pedir?`,
        shouldCreateOrder: false
      }
    }

    case 'greeting':
    case 'unknown':
    default:
      // Update customer name if learned
      if (gptIntent.customer_name && !customer.name) {
        await updateCustomer(customer.id, { name: gptIntent.customer_name })
      }

      return {
        response: gptIntent.message,
        shouldCreateOrder: false
      }
  }
}

export function clearPendingOrder(phoneNumber: string) {
  pendingOrders.delete(phoneNumber)
}